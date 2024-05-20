import { Injectable, Signal, inject } from '@angular/core';
import {
  realtimeUpdatesFromTable,
  Table,
  Function,
  SessionStatus,
} from '../util/supabase-helpers';
import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';
import { Observable, map, shareReplay } from 'rxjs';
import { whenNotNull } from '../util/rxjs-helpers';
import { toSignal } from '@angular/core/rxjs-interop';
import { SessionModel } from '../util/supabase-types';
import { Database } from '../util/schema';
import { GameStateService } from './game-state.service';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly supabase: SupabaseClient<Database> = inject(SupabaseClient);
  private readonly gameStateService = inject(GameStateService);

  readonly session$: Observable<SessionModel | null> =
    this.gameStateService.sessionId$.pipe(
      whenNotNull((activeSessionId) =>
        realtimeUpdatesFromTable(
          this.supabase,
          Table.Session,
          `id=eq.${activeSessionId}`,
        ).pipe(map((sessionRecords) => sessionRecords[0])),
      ),
      shareReplay(1),
    );

  readonly session: Signal<SessionModel | null | undefined> = toSignal(
    this.session$,
  );

  async createSession(
    sessionName: string,
    startDate: Date,
    endDate: Date,
    numRounds: number,
    playerUserIds: string[],
  ): Promise<PostgrestSingleResponse<undefined>> {
    return this.supabase.rpc(Function.CreateSession, {
      session_name: sessionName,
      session_start_date: startDate.toISOString(),
      session_end_date: endDate.toISOString(),
      num_rounds: numRounds,
      player_user_ids: playerUserIds,
    });
  }

  async startSession(): Promise<PostgrestSingleResponse<null>> {
    return this.supabase
      .from(Table.GameState)
      .update({
        session_status: SessionStatus.InProgress,
      })
      .eq('id', 1);
  }

  async startSessionEarly(): Promise<PostgrestSingleResponse<undefined>> {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // convert to UTC

    return this.supabase.rpc(Function.StartSessionEarly, {
      now: now.toISOString(),
    });
  }

  async endSession(): Promise<PostgrestSingleResponse<null>> {
    return this.supabase
      .from(Table.GameState)
      .update({
        session_status: SessionStatus.Finished,
      })
      .eq('id', 1);
  }

  async editSessionProperties(
    sessionId: number,
    partialSession: Partial<SessionModel>,
  ): Promise<PostgrestSingleResponse<null>> {
    return this.supabase
      .from(Table.Session)
      .update(partialSession)
      .eq('id', sessionId);
  }

  async endRound(
    roundNumber: number,
    playerScoreChanges: Record<string, number>,
  ): Promise<PostgrestSingleResponse<undefined>> {
    return this.supabase.rpc(Function.EndRound, {
      _round_number: roundNumber,
      player_score_changes: playerScoreChanges,
    });
  }
}
