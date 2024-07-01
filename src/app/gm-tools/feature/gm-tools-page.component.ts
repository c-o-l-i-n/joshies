import { CardLinkModel } from '../../shared/ui/card-link.component';
import { CardComponent } from '../../shared/ui/card.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Signal,
} from '@angular/core';
import { GameStateService } from '../../shared/data-access/game-state.service';
import {
  EventFormat,
  RoundPhase,
  SessionStatus,
} from '../../shared/util/supabase-helpers';
import { EventService } from '../../shared/data-access/event.service';

@Component({
  selector: 'joshies-gm-tools-pages-wrapper',
  standalone: true,
  imports: [CardComponent, PageHeaderComponent],
  template: `
    <joshies-page-header headerText="GM Tools" />

    @if (roundLinks(); as roundLinks) {
      <joshies-card headerText="Round" [links]="roundLinks" />
    }

    <joshies-card headerText="Betting" [links]="bettingLinks" />

    <joshies-card headerText="Players" [links]="playersLinks" />

    <joshies-card headerText="Session" [links]="sessionLinks()" />
  `,
  host: {
    class: 'block pb-6',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GmToolsPageComponent {
  private readonly gameStateService = inject(GameStateService);
  private readonly eventService = inject(EventService);

  private readonly eventFormat = computed(() => {
    return this.eventService.eventForThisRound()?.format;
  });

  private readonly roundPhaseDependentLinks: Record<
    RoundPhase | 'undefined',
    CardLinkModel[] | null
  > = {
    [RoundPhase.GameboardMoves]: [
      {
        text: 'Enter Gameboard Moves',
        iconClass: 'ci-space-entry bg-gray-500',
        routerLink: './space-entry',
      },
    ],
    [RoundPhase.SpecialSpaceEvents]: [
      {
        text: 'Resolve Special Space Events',
        iconClass: 'pi pi-question-circle bg-green-500',
        routerLink: './resolve-special-space-events',
      },
    ],
    [RoundPhase.Duels]: [
      {
        text: 'Resolve Duels',
        iconClass: 'pi pi-bolt bg-purple-500',
        routerLink: './resolve-duels',
      },
    ],
    [RoundPhase.ChaosSpaceEvents]: [
      {
        text: 'Resolve Chaos Space Events',
        iconClass: 'pi pi-exclamation-circle bg-black',
        routerLink: './resolve-chaos-space-events',
      },
    ],
    [RoundPhase.Event]: [
      this.eventFormat() === EventFormat.ScoreBasedSingleRound
        ? {
            text: 'Enter Event Scores',
            iconClass: 'pi pi-bolt bg-orange-500',
            routerLink: './enter-event-scores',
          }
        : this.eventFormat() === EventFormat.SingleEliminationTournament
          ? {
              text: 'Enter Tournament Results',
              iconClass: 'pi pi-bolt bg-orange-500',
              routerLink: './enter-tournament-results',
            }
          : {
              text: 'No Event Found',
              iconClass: 'pi pi-question bg-red-500',
              routerLink: '.',
            },
    ],
    [RoundPhase.WaitingForNextRound]: [
      {
        text: 'End Round & Tally Points',
        iconClass: 'pi pi-check-circle bg-green-500',
        routerLink: './end-round',
      },
    ],
    undefined: null,
  };

  readonly roundLinks: Signal<CardLinkModel[] | null> = computed(() => {
    if (!this.gameStateService.sessionIsInProgress()) return null;

    return this.roundPhaseDependentLinks[
      this.gameStateService.roundPhase() ?? 'undefined'
    ];
  });

  readonly bettingLinks: CardLinkModel[] = [
    {
      text: 'Settle or Cancel Bets',
      iconClass: 'pi pi-check bg-green-500',
      routerLink: './resolve-bets',
    },
    {
      text: 'Bulk Cancel Bets',
      iconClass: 'pi pi-trash bg-red-500',
      routerLink: './bet-bulk-cancel',
    },
  ];

  readonly playersLinks: CardLinkModel[] = [
    {
      text: 'Override Points',
      iconClass: 'pi pi-sliders-h bg-purple-500',
      routerLink: './override-points',
    },
    {
      text: 'Edit Player Profiles',
      iconClass: 'pi pi-user-edit bg-blue-500',
      routerLink: './edit-profiles',
    },
    {
      text: 'Edit Player Permissions',
      iconClass: 'pi pi-lock bg-orange-500',
      routerLink: './edit-permissions',
    },
    {
      text: 'Make Someone Else the GM',
      iconClass: 'pi pi-crown bg-yellow-500',
      routerLink: './change-gm',
    },
  ];

  private readonly sessionStatusDependentLinks: Record<
    SessionStatus | 'undefined',
    CardLinkModel[]
  > = {
    [SessionStatus.NotStarted]: [
      {
        text: 'Start Session Early',
        iconClass: 'pi pi-play-circle bg-green-500',
        routerLink: './start-session-early',
      },
    ],
    [SessionStatus.InProgress]: [
      {
        text: 'Override Bank Balance',
        iconClass: 'pi pi-building-columns bg-yellow-500',
        routerLink: './override-bank-balance',
      },
      {
        text: 'End Session',
        iconClass: 'pi pi-stop-circle bg-red-600',
        routerLink: './end-session',
      },
    ],
    [SessionStatus.Finished]: [
      {
        text: 'Create Session',
        iconClass: 'pi pi-plus bg-blue-500',
        routerLink: './create-session',
      },
    ],
    undefined: [],
  };

  readonly sessionLinks: Signal<CardLinkModel[]> = computed(
    (): CardLinkModel[] => [
      {
        text: 'Manage Gameboard Spaces',
        iconClass: 'ci-space-entry bg-gray-500',
        routerLink: './space-types',
      },
      {
        text: 'Manage Special Space Events',
        iconClass: 'pi pi-question-circle bg-green-500',
        routerLink: './special-space-event-templates',
      },
      {
        text: 'Manage Chaos Space Events',
        iconClass: 'pi pi-exclamation-circle bg-black',
        routerLink: './chaos-space-event-templates',
      },
      {
        text: 'Manage Events',
        iconClass: 'pi pi-flag bg-purple-500',
        routerLink: './events',
      },
      {
        text: 'Create Brackets',
        iconClass: 'pi pi-sitemap bg-yellow-500',
        routerLink: './bracket',
      },
      ...this.sessionStatusDependentLinks[
        this.gameStateService.sessionStatus() ?? 'undefined'
      ],
    ],
  );
}
