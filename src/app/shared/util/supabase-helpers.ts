import { SupabaseClient } from '@supabase/supabase-js';
import { Observable, switchMap } from 'rxjs';
import { Signal, TrackByFunction } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { showErrorMessage } from './message-helpers';
import { Database, Tables } from './schema';
import { RealtimeFilter, liveTable } from './supabase-live-table';
import { PlayerModel, TransactionModel } from './supabase-types';

export enum Table {
  User = 'user',
  UserNotificationsSubscription = 'user_notifications_subscription',
  GameState = 'game_state',
  GameboardSpace = 'gameboard_space',
  GameboardMove = 'gameboard_move',
  Session = 'session',
  Transaction = 'transaction',
  Player = 'player',
  PlayerRoundScore = 'player_round_score',
  Rules = 'rules',
  Event = 'event',
  EventFormatStandardScoringFormula = 'event_format_standard_scoring_formula',
  EventParticipant = 'event_participant',
  EventTeam = 'event_team',
  EventTeamRoundScore = 'event_team_round_score',
  SpecialSpaceEvent = 'special_space_event',
  SpecialSpaceEventTemplate = 'special_space_event_template',
}

export enum View {
  LifetimeUserStats = 'lifetime_user_stats',
  MovesForCurrentRound = 'moves_for_current_round',
  SpecialSpaceEventsForCurrentRound = 'special_space_events_for_current_round',
}

export enum Function {
  CreateSession = 'create_session',
  EndRound = 'end_round',
  GetAllScoresFromSession = 'get_all_scores_from_session',
  GetPlayerRoundScoresFromSession = 'get_player_round_scores_from_session',
  OverridePoints = 'override_points',
  StartSessionEarly = 'start_session_early',
  LogRoundMoves = 'log_round_moves',
  ReorderEvents = 'reorder_events',
  SubmitGainPointsBasedOnRank = 'submit_gain_points_based_on_rank',
  SubmitSpecialSpaceEventScore = 'submit_special_space_event_score',
}

export enum StorageBucket {
  Avatars = 'avatars',
}

export enum SessionStatus {
  NotStarted = 'not_started',
  InProgress = 'in_progress',
  Finished = 'finished',
}

export enum GameboardSpaceEffect {
  GainPoints = 'gain_points',
  GainPointsOrDoActivity = 'gain_points_or_do_activity',
  Special = 'special',
  Duel = 'duel',
}

export enum SpaceEventStatus {
  EventNotSelected = 'event_not_selected',
  WaitingToBegin = 'waiting_to_begin',
  InProgress = 'in_progress',
  Finished = 'finished',
  Canceled = 'canceled',
}

export enum EventFormat {
  SingleEliminationTournament = 'single_elimination_tournament',
  DoubleEliminationTournament = 'double_elimination_tournament',
  ScoreBasedSingleRound = 'score_based_single_round',
}

export enum RoundPhase {
  GameboardMoves = 'gameboard_moves',
  SpecialSpaceEvents = 'special_space_events',
  Duels = 'duels',
  Event = 'event',
  WaitingForNextRound = 'waiting_for_next_round',
}

export type TTable = keyof Database['public']['Tables'];

function subscribeToLiveTable<Table extends TTable, Row extends Tables<Table>>(
  supabase: SupabaseClient<Database>,
  table: Table,
  callback: (rows: readonly Row[]) => void,
  filter?: RealtimeFilter<Database, Table>,
): () => Promise<'ok' | 'timed out' | 'error'> {
  const channel = liveTable(supabase, {
    table,
    filter,
    callback: (error, rows: readonly Row[]) => {
      if (error) {
        channel
          .unsubscribe()
          .then(() => subscribeToLiveTable(supabase, table, callback, filter));
        return;
      }
      callback(rows);
    },
  });

  return () => channel?.unsubscribe();
}

export function realtimeUpdatesFromTable<
  Table extends TTable,
  Row extends Tables<Table>,
>(
  supabase: SupabaseClient<Database>,
  table: Table,
  filter?: RealtimeFilter<Database, Table>,
): Observable<Row[]> {
  return new Observable((subscriber) =>
    subscribeToLiveTable(
      supabase,
      table,
      (rows) => subscriber.next(rows as Row[]),
      filter,
    ),
  );
}

export function realtimeUpdatesFromTableAsSignal<
  Table extends TTable,
  Row extends Tables<Table>,
>(
  supabase: SupabaseClient<Database>,
  table: Table,
  filter?:
    | Signal<RealtimeFilter<Database, Table> | undefined>
    | RealtimeFilter<Database, Table>,
): Signal<Row[]> {
  if (typeof filter === 'string' || filter === undefined) {
    return toSignal(realtimeUpdatesFromTable(supabase, table, filter), {
      initialValue: [],
    });
  }

  return toSignal(
    toObservable(filter).pipe(
      switchMap((filter) =>
        realtimeUpdatesFromTable<Table, Row>(supabase, table, filter),
      ),
    ),
    { initialValue: [] },
  );
}

export async function showMessageOnError<T>(
  promise: PromiseLike<T>,
  messageService: MessageService,
  message?: string,
): Promise<T> {
  const response = await promise;
  const error = (response as { error?: { message?: string } }).error;

  if (error) {
    showErrorMessage(
      message ?? error.message ?? 'Please try again later',
      messageService,
    );
  }

  return response;
}

interface RowWithId {
  id: number | string;
}

export const trackById: TrackByFunction<RowWithId> = (index, row: RowWithId) =>
  row.id;

export const trackByPlayerId: TrackByFunction<
  Pick<TransactionModel, 'player_id'>
> = (index, row) => row.player_id;

export const trackByUserId: TrackByFunction<Pick<PlayerModel, 'user_id'>> = (
  index,
  row,
) => row.user_id;
