import { inject, Injectable, Signal } from '@angular/core';
import {
  realtimeUpdatesFromTable,
  Table,
  Function,
  EdgeFunction,
} from '../util/supabase-helpers';
import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';
import { SessionService } from './session.service';
import {
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
  shareReplay,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import { defined, distinctUntilIdChanged } from '../util/rxjs-helpers';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../auth/data-access/auth.service';
import { PlayerModel, SessionModel, UserModel } from '../util/supabase-types';
import { Database } from '../util/schema';
import { GameStateService } from './game-state.service';
import { addRankingInfoToPlayers } from '../util/ranking-helpers';

export interface PlayerWithUserInfo {
  player_id: number;
  user_id: string;
  score: number;
  enabled: boolean;
  display_name: string;
  real_name: string;
  avatar_url: string;
  can_edit_profile: boolean;
  can_place_bets: boolean;
  squidward_mode: boolean;
  can_toggle_squidward_mode: boolean;
}

export interface PlayerWithUserAndRankInfo extends PlayerWithUserInfo {
  rank: number;
  rankEmoji: string | undefined;
}

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private readonly supabase: SupabaseClient<Database> = inject(SupabaseClient);
  private readonly authService = inject(AuthService);
  private readonly sessionService = inject(SessionService);
  private readonly gameStateService = inject(GameStateService);

  readonly playersWithoutDisplayNames$: Observable<PlayerModel[]> =
    this.sessionService.session$.pipe(
      distinctUntilIdChanged(),
      switchMap((session) =>
        realtimeUpdatesFromTable(
          this.supabase,
          Table.Player,
          `session_id=eq.${session.id}`,
        ),
      ),
      shareReplay(1),
    );

  private readonly playerUsers$: Observable<UserModel[]> =
    this.playersWithoutDisplayNames$.pipe(
      distinctUntilChanged(
        (a, b) =>
          (a === null && b === null) ||
          (a !== null && a.every((val, idx) => val === b?.[idx])),
      ),
      switchMap((players) =>
        realtimeUpdatesFromTable(
          this.supabase,
          Table.User,
          `id=in.(${players.map((player) => player.user_id)})`,
        ),
      ),
      shareReplay(1),
    );

  readonly playersIncludingDisabled$: Observable<PlayerWithUserInfo[]> =
    this.playerUsers$.pipe(
      withLatestFrom(this.playersWithoutDisplayNames$),
      map(([users, players]) =>
        players
          .map((player) => {
            const user = users.find((user) => user.id === player.user_id)!;
            return {
              player_id: player.id,
              user_id: user.id,
              score: player.score,
              enabled: player.enabled,
              display_name: user.display_name,
              real_name: user.real_name,
              avatar_url: user.avatar_url,
              can_edit_profile: user.can_edit_profile,
              can_place_bets: user.can_place_bets,
              squidward_mode: user.squidward_mode,
              can_toggle_squidward_mode: user.can_toggle_squidward_mode,
            };
          })
          .sort((a, b) => b.score - a.score),
      ),
      shareReplay(1),
    );

  readonly playersIncludingDisabled: Signal<PlayerWithUserInfo[] | undefined> =
    toSignal(this.playersIncludingDisabled$);

  readonly players$: Observable<PlayerWithUserAndRankInfo[]> =
    this.playersIncludingDisabled$.pipe(
      map((players) => addRankingInfoToPlayers(players, true)),
      shareReplay(1),
    );

  readonly players: Signal<PlayerWithUserAndRankInfo[] | undefined> = toSignal(
    this.players$,
  );

  readonly userPlayer$: Observable<PlayerWithUserInfo | null> =
    this.authService.user$.pipe(
      defined(),
      switchMap((authUser) =>
        this.playersIncludingDisabled$.pipe(
          map(
            (players) =>
              players.find((player) => player.user_id === authUser.id) ?? null,
          ),
        ),
      ),
      shareReplay(1),
    );

  readonly userPlayer: Signal<PlayerWithUserInfo | null | undefined> = toSignal(
    this.userPlayer$,
  );

  readonly userPlayerId$: Observable<PlayerModel['id'] | null> =
    this.userPlayer$.pipe(
      map((userPlayer) => userPlayer?.player_id ?? null),
      shareReplay(1),
    );

  readonly userPlayerId: Signal<PlayerModel['id'] | null | undefined> =
    toSignal(this.userPlayerId$);

  readonly userIsGameMaster$: Observable<boolean> = combineLatest({
    user: this.authService.user$,
    gameMasterUserId: this.gameStateService.gameMasterUserId$,
  }).pipe(
    map(({ user, gameMasterUserId }) => user?.id === gameMasterUserId),
    shareReplay(1),
  );

  readonly userIsGameMaster: Signal<boolean | undefined> = toSignal(
    this.userIsGameMaster$,
  );

  async addPlayers(
    sessionId: SessionModel['id'],
    newPlayerUserIds: UserModel['id'][],
  ): Promise<PostgrestSingleResponse<null>> {
    return this.supabase
      .from(Table.Player)
      .insert<Pick<PlayerModel, 'session_id' | 'user_id'>>(
        newPlayerUserIds.map((userId) => ({
          session_id: sessionId,
          user_id: userId,
        })),
      );
  }

  async overridePointsAdd(
    playerId: number,
    numPointsToAdd: number,
    comment: string,
    addLostPointsToBankBalance: boolean,
  ): Promise<PostgrestSingleResponse<undefined>> {
    const response = this.supabase.rpc(Function.OverridePoints, {
      data: { playerId, change: numPointsToAdd, comment, replace: false },
      add_lost_points_to_bank_balance: addLostPointsToBankBalance,
    });
    this.supabase.functions.invoke(`${EdgeFunction.Push}/override`, {
      body: { playerId, numPoints: numPointsToAdd, comment, replace: false },
    });
    return response;
  }

  async overridePointsReplace(
    playerId: number,
    newScore: number,
    comment: string,
    addLostPointsToBankBalance: boolean,
  ): Promise<PostgrestSingleResponse<undefined>> {
    const response = this.supabase.rpc(Function.OverridePoints, {
      data: { playerId, change: newScore, comment, replace: true },
      add_lost_points_to_bank_balance: addLostPointsToBankBalance,
    });
    this.supabase.functions.invoke(`${EdgeFunction.Push}/override`, {
      body: { playerId, numPoints: newScore, comment, replace: true },
    });
    return response;
  }

  async setEnabled(
    playerId: number,
    enabled: boolean,
  ): Promise<PostgrestSingleResponse<null>> {
    return this.supabase
      .from(Table.Player)
      .update({ enabled })
      .eq('id', playerId);
  }
}
