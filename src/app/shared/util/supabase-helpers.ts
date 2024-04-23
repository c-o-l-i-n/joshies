import {
  PostgrestSingleResponse,
  REALTIME_LISTEN_TYPES,
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT,
  RealtimePostgresChangesPayload,
  SupabaseClient,
} from '@supabase/supabase-js';
import { from, map, Observable, scan, startWith, switchMap } from 'rxjs';
import { Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { showErrorMessage } from './message-helpers';
import { Database, Tables } from './schema';

export enum Table {
  User = 'user',
  UserNotificationsSubscription = 'user_notifications_subscription',
  GameState = 'game_state',
  Session = 'session',
  Transaction = 'transaction',
  Player = 'player',
  Rules = 'rules',
}

export enum View {
  LifetimeUserStats = 'lifetime_user_stats',
}

export enum Function {
  GetAllScoresFromSession = 'get_all_scores_from_session',
  EndRound = 'end_round',
  OverridePoints = 'override_points',
}

export enum StorageBucket {
  Avatars = 'avatars',
}

type TableName = keyof Database['public']['Tables'];

type FilterOperator = 'eq' | 'neq' | 'lt' | 'lte' | 'gt' | 'gte' | 'in';

export type Filter<T extends TableName> = `${Exclude<
  keyof Tables<T>,
  symbol
>}=${FilterOperator}.${string}`;

export function realtimeUpdatesFromTable<
  T extends TableName,
  Model extends Tables<T>,
>(
  supabase: SupabaseClient<Database>,
  table: T,
  filter?: Filter<T>,
): Observable<Model[]> {
  let initialQuery$: Observable<PostgrestSingleResponse<Model[]>>;

  if (filter) {
    const [, filterColumn, filterOperator, filterValue] =
      filter.match(/^(.+)=([^.]+)\.(.+)$/)!;

    initialQuery$ = from(
      supabase
        .from(table)
        .select('*')
        .filter(filterColumn, filterOperator, filterValue)
        .returns<Model[]>(),
    );
  } else {
    initialQuery$ = from(supabase.from(table).select('*').returns<Model[]>());
  }

  const initialValue$: Observable<Model[]> = initialQuery$.pipe(
    map((response) => response.data!),
  );

  const changes$ = new Observable<RealtimePostgresChangesPayload<Model>>(
    (subscriber) => {
      const subscription = supabase
        .channel(`${table}-table-changes-${Math.random()}`)
        .on<Model>(
          REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
          {
            event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.ALL,
            schema: 'public',
            table,
            filter,
          },
          (payload) => subscriber.next(payload),
        )
        .subscribe();

      return function unsubscribe() {
        subscription?.unsubscribe();
      };
    },
  );

  return initialValue$.pipe(
    switchMap((initialValue) =>
      changes$.pipe(
        scan(
          (
            allRecords: Model[],
            change: RealtimePostgresChangesPayload<Model>,
          ) => {
            const changedRecord = (
              (change.new as Model).id ? change.new : change.old
            ) as Model;

            switch (change.eventType) {
              case REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.INSERT:
                return [...allRecords, changedRecord];

              case REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.DELETE:
                return allRecords.filter(
                  (record) => record.id !== changedRecord.id,
                );

              case REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE:
                return allRecords.map((record) =>
                  record.id === changedRecord.id ? changedRecord : record,
                );

              default:
                return allRecords;
            }
          },
          initialValue,
        ),
        startWith(initialValue),
      ),
    ),
  );
}

export function realtimeUpdatesFromTableAsSignal<
  T extends TableName,
  Model extends Tables<T>,
>(
  supabase: SupabaseClient<Database>,
  table: T,
  filter?: Signal<Filter<T> | undefined> | Filter<T>,
): Signal<Model[]> {
  if (typeof filter === 'string' || filter === undefined) {
    return toSignal(
      realtimeUpdatesFromTable<T, Model>(supabase, table, filter),
      {
        initialValue: [],
      },
    );
  }

  return toSignal(
    toObservable(filter).pipe(
      // filterOperator((filter) => filter !== undefined),
      switchMap((filter) =>
        realtimeUpdatesFromTable<T, Model>(supabase, table, filter),
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
