import { computed, inject, Injectable, Signal } from '@angular/core';
import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';
import { Database, Json } from '../util/schema';
import { GameStateService } from './game-state.service';
import {
  combineLatestWith,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
} from 'rxjs';
import {
  EventModel,
  EventParticipantModel,
  EventTeamModel,
  OmitAutoGeneratedColumns,
} from '../util/supabase-types';
import { whenAllValuesNotNull, whenNotNull } from '../util/rxjs-helpers';
import {
  Function,
  realtimeUpdatesFromTable,
  showMessageOnError,
  StorageBucket,
  Table,
} from '../util/supabase-helpers';
import { toSignal } from '@angular/core/rxjs-interop';
import { resizeImage } from '../util/image-helpers';
import { MessageService } from 'primeng/api';
import { PlayerService } from './player.service';

export interface EventParticipantWithPlayerInfo {
  participant_id: number;
  team_id: number;
  player_id: number;
  display_name: string;
  avatar_url: string;
}

export interface EventTeamWithParticipantInfo extends EventTeamModel {
  participants: EventParticipantWithPlayerInfo[] | undefined;
}

export interface EventTeamUpdateModel {
  newEventTeams:
    | {
        id: number;
        event_id: number;
        seed: number;
      }[]
    | undefined;

  updatedTeams:
    | {
        id: number;
        seed: number;
      }[]
    | undefined;

  removedTeams:
    | {
        id: number;
      }[]
    | undefined;

  newParticipants:
    | {
        player_id: number;
        team_id: number;
      }[]
    | undefined;

  updatedParticipants:
    | {
        id: number;
        team_id: number;
      }[]
    | undefined;

  removedParticipants:
    | {
        id: number;
      }[]
    | undefined;
}

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private readonly supabase: SupabaseClient<Database> = inject(SupabaseClient);
  private readonly gameStateService = inject(GameStateService);
  private readonly messageService = inject(MessageService);
  private readonly playerService = inject(PlayerService);

  readonly events$: Observable<EventModel[]> =
    this.gameStateService.sessionId$.pipe(
      switchMap((sessionId) =>
        realtimeUpdatesFromTable(
          this.supabase,
          Table.Event,
          `session_id=eq.${sessionId}`,
        ).pipe(
          map((events) =>
            events.sort((a, b) => a.round_number - b.round_number),
          ),
        ),
      ),
      shareReplay(1),
    );

  readonly eventForThisRound$: Observable<EventModel | null> =
    this.gameStateService.roundNumber$.pipe(
      switchMap((roundNumber) =>
        this.events$.pipe(
          map(
            (events) =>
              events?.find((event) => event.round_number === roundNumber) ??
              null,
          ),
        ),
      ),
    );

  readonly eventForThisRound = toSignal(this.eventForThisRound$);

  readonly eventForNextRound$: Observable<EventModel | null> =
    this.gameStateService.roundNumber$.pipe(
      switchMap((roundNumber) =>
        this.events$.pipe(
          map(
            (events) =>
              events?.find((event) => event.round_number === roundNumber + 1) ??
              null,
          ),
        ),
      ),
    );

  readonly eventForNextRound = toSignal(this.eventForNextRound$);

  readonly events = toSignal(this.events$);

  readonly eventTeams$: Observable<EventTeamModel[] | null> = this.events$.pipe(
    map((events) => events?.map((ev) => ev.id) ?? null),
    whenNotNull((eventIds) =>
      realtimeUpdatesFromTable(
        this.supabase,
        Table.EventTeam,
        `event_id=in.(${eventIds})`,
      ),
    ),
    shareReplay(1),
  );

  readonly eventTeams = toSignal(this.eventTeams$);

  readonly eventTeamsWithParticipantInfo: Signal<
    EventTeamWithParticipantInfo[] | undefined | null
  > = computed(() => {
    const eventTeams = this.eventTeams();
    const eventParticipantsWithPlayerInfo =
      this.eventParticipantsWithPlayerInfo();

    if (!eventTeams) return eventTeams;
    if (!eventParticipantsWithPlayerInfo)
      return eventParticipantsWithPlayerInfo;

    return eventTeams.map((eventTeam) => ({
      ...eventTeam,
      participants: this.eventParticipantsWithPlayerInfo()?.filter(
        (eventParticipant) => eventParticipant.team_id === eventTeam.id,
      ),
    }));
  });

  readonly eventParticipants$: Observable<EventParticipantModel[] | null> =
    this.eventTeams$.pipe(
      map((eventTeams) => eventTeams?.map((eventTeam) => eventTeam.id) ?? null),
      whenNotNull((eventTeamIds) =>
        realtimeUpdatesFromTable(
          this.supabase,
          Table.EventParticipant,
          `team_id=in.(${eventTeamIds})`,
        ),
      ),
      shareReplay(1),
    );

  readonly eventParticipants = toSignal(this.eventParticipants$);

  readonly eventParticipantsWithPlayerInfo$: Observable<
    EventParticipantWithPlayerInfo[] | null
  > = this.eventParticipants$.pipe(
    combineLatestWith(this.playerService.players$),
    map(([participants, players]) => ({ participants, players })),
    whenAllValuesNotNull(({ participants, players }) =>
      of(
        participants.map((participant) => {
          const player = players.find(
            (p) => p.player_id === participant.player_id,
          )!;

          return {
            participant_id: participant.id,
            team_id: participant.team_id,
            player_id: participant.player_id,
            display_name: player.display_name,
            avatar_url: player.avatar_url,
          };
        }),
      ),
    ),
    shareReplay(1),
  );

  readonly eventParticipantsWithPlayerInfo: Signal<
    EventParticipantWithPlayerInfo[] | null | undefined
  > = toSignal(this.eventParticipantsWithPlayerInfo$);

  async createEvent(
    event: OmitAutoGeneratedColumns<EventModel>,
  ): Promise<PostgrestSingleResponse<null>> {
    return this.supabase.from(Table.Event).insert(event);
  }

  async updateEvent(
    eventId: number,
    partialEvent: Partial<OmitAutoGeneratedColumns<EventModel>>,
  ): Promise<PostgrestSingleResponse<null>> {
    return this.supabase
      .from(Table.Event)
      .update(partialEvent)
      .eq('id', eventId);
  }

  async deleteEvent(eventId: number): Promise<PostgrestSingleResponse<null>> {
    return this.supabase.from(Table.Event).delete().eq('id', eventId);
  }

  async reorderEvents(
    eventsWithNewRoundNumber: Record<number, number>,
  ): Promise<PostgrestSingleResponse<undefined>> {
    return this.supabase.rpc(Function.ReorderEvents, {
      events_with_new_round_number: eventsWithNewRoundNumber,
    });
  }

  //Upload a given image to supabase. Return its new address to be displayed & saved
  async uploadImage(image: File): Promise<string> {
    const resizedImage = await resizeImage(image, 200);
    const uploadPath = `events/${Date.now()}.webp`;

    const { data: uploadData, error: uploadError } = await showMessageOnError(
      this.supabase.storage
        .from(StorageBucket.EventImages)
        .upload(uploadPath, resizedImage),
      this.messageService,
    );

    if (uploadError) {
      return '';
    }

    return this.supabase.storage
      .from(StorageBucket.EventImages)
      .getPublicUrl(uploadData.path).data.publicUrl;
  }

  async updateEventTeams(
    eventTeamUpdates: Json,
  ): Promise<PostgrestSingleResponse<undefined>> {
    return this.supabase.rpc(Function.UpdateEventTeams, {
      event_team_updates: eventTeamUpdates,
    });
  }
}
