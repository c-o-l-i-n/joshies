import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { SessionService } from '../../shared/data-access/session.service';
import { CountdownTimerComponent } from '../../shared/ui/countdown-timer.component';
import { PlayerService } from '../../shared/data-access/player.service';
import { SkeletonModule } from 'primeng/skeleton';
import { GameStateService } from '../../shared/data-access/game-state.service';
import {
  SessionStatus,
  RoundPhase,
  GameboardSpaceEffect,
  BetStatus,
  DuelStatus,
} from '../../shared/util/supabase-helpers';
import { RankingsTableComponent } from '../../shared/ui/rankings-table.component';
import { undefinedUntilAllPropertiesAreDefined } from '../../shared/util/signal-helpers';
import { AuthService } from '../../auth/data-access/auth.service';
import { CardComponent } from '../../shared/ui/card.component';
import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { SpaceEventTableComponent } from '../../home/ui/space-event-table.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { of, switchMap } from 'rxjs';
import { GameboardService } from '../../shared/data-access/gameboard.service';
import { DuelService } from '../../shared/data-access/duel.service';
import { DuelTableAvatarsComponent } from '../../shared/ui/duel-table-avatars.component';
import { StatusTagComponent } from '../../gm-tools/ui/status-tag.component';
import { EventInfoComponent } from '../../shared/ui/event-info.component';
import { EventService } from '../../shared/data-access/event.service';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { BetService } from '../../shared/data-access/bet.service';
import { BetComponent } from '../../shared/ui/bet.component';

@Component({
  selector: 'joshies-dashboard-page',
  standalone: true,
  imports: [
    CountdownTimerComponent,
    SkeletonModule,
    RankingsTableComponent,
    CardComponent,
    DecimalPipe,
    SpaceEventTableComponent,
    DuelTableAvatarsComponent,
    StatusTagComponent,
    EventInfoComponent,
    NgOptimizedImage,
    ButtonModule,
    CarouselModule,
    BetComponent,
  ],
  template: `
    @if (viewModel(); as vm) {
      @if (vm.countdown) {
        <joshies-countdown-timer [countdown]="vm.countdown" />
      } @else {
        <div class="flex flex-column justify-content-between m-4 h-full">
          <div class="flex-shrink-1">
            <h1 class="text-6xl font-semibold mt-0 mb-4">
              {{ vm.session.name }}
            </h1>
            <div class="grid">
              @if (vm.showRankingsTable) {
                <!-- Rankings Table -->
                <div class="col-3">
                  <h2 class="mt-0 mb-2">
                    <i class="pi pi-trophy text-primary mr-2"></i>
                    {{ vm.rankingsTableHeader }}
                  </h2>
                  <joshies-rankings-table
                    [players]="vm.players!"
                    [userId]="null"
                  />
                </div>
              }
              @if (vm.sessionIsInProgress) {
                <div class="col-4 ml-7">
                  <!-- Happening Now -->
                  <joshies-card
                    class="mb-7"
                    headerText="Happening Now"
                    headerIconClass="pi pi-star text-primary mr-2"
                    readOnly
                    padded
                  >
                    @switch (vm.roundPhase) {
                      @case (RoundPhase.GameboardMoves) {
                        <div class="flex gap-3">
                          <img
                            ngSrc="/assets/dice-roll.gif"
                            alt=""
                            width="48"
                            height="48"
                            class="border-round"
                          />
                          <div>
                            <p class="mt-0 mb-1">
                              Gameboard moves for turn
                              <strong>{{ vm.roundNumber | number }}</strong>
                              of <strong>{{ vm.numRounds }}</strong
                              >.
                            </p>
                            <p class="m-0">Let's get rolling!</p>
                          </div>
                        </div>
                      }
                      @case (RoundPhase.SpecialSpaceEvents) {
                        <p class="mt-0 mb-2">Special Space Events:</p>

                        <joshies-space-event-table
                          [spaceEvents]="vm.specialSpaceEvents"
                          [spaceType]="GameboardSpaceEffect.Special"
                          readOnly
                        />
                      }
                      @case (RoundPhase.Duels) {
                        <p class="mt-0 mb-2">Duels:</p>

                        <table class="w-full">
                          <tbody>
                            @for (duel of vm.duels; track duel.id) {
                              <tr>
                                <td class="pt-1 pr-2">
                                  <joshies-duel-table-avatars [duel]="duel" />
                                </td>

                                <td class="text-sm">{{ duel.game_name }}</td>

                                <td class="pt-1 text-right">
                                  <joshies-status-tag [status]="duel.status" />
                                </td>
                              </tr>
                            } @empty {
                              <tr>
                                <td class="font-italic text-600">
                                  No duels for this turn
                                </td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      }
                      @case (RoundPhase.ChaosSpaceEvents) {
                        <p class="mt-0 mb-2">Chaos Space Events:</p>

                        <joshies-space-event-table
                          [spaceEvents]="vm.chaosSpaceEvents"
                          [spaceType]="GameboardSpaceEffect.Chaos"
                          readOnly
                        />
                      }
                      @case (RoundPhase.Event) {
                        @if (vm.eventForThisRound; as event) {
                          <joshies-event-info [event]="event" readOnly />
                        } @else {
                          <span class="text-red font-semibold">
                            There's no event scheduled for this turn 😳 Tell the
                            GM to get on it 😤
                          </span>
                        }
                      }
                      @case (RoundPhase.WaitingForNextRound) {
                        @if (vm.roundNumber < vm.numRounds) {
                          Stretch those dice-rolling fingers in preparation for
                          the next turn.
                        } @else {
                          🏆 Awards Ceremony
                        }
                      }
                    }
                  </joshies-card>

                  <!-- Up Next -->
                  <joshies-card
                    class="mb-7"
                    headerText="Up Next"
                    headerIconClass="pi pi-arrow-circle-right text-primary mr-2"
                    readOnly
                    padded
                  >
                    @switch (vm.roundPhase) {
                      @case (RoundPhase.GameboardMoves) {
                        <p class="mt-0 mb-1">
                          Special Space events, duels, and Chaos Space events.
                        </p>
                        <p class="mt-0">Then, our next event:</p>

                        @if (vm.eventForThisRound; as event) {
                          <joshies-event-info [event]="event" readOnly />
                        } @else {
                          <span class="text-red font-semibold">
                            There's no event scheduled for this turn 😳 Tell the
                            GM to get on it 😤
                          </span>
                        }
                      }
                      @case (RoundPhase.SpecialSpaceEvents) {
                        <p class="mt-0 mb-1">Duels and Chaos Space events.</p>
                        <p class="mt-0">Then, our next event:</p>

                        @if (vm.eventForThisRound; as event) {
                          <joshies-event-info [event]="event" readOnly />
                        } @else {
                          <span class="text-red font-semibold">
                            There's no event scheduled for this turn 😳 Tell the
                            GM to get on it 😤
                          </span>
                        }
                      }
                      @case (RoundPhase.Duels) {
                        <p class="mt-0">
                          Chaos Space events, and then our next event:
                        </p>

                        @if (vm.eventForThisRound; as event) {
                          <joshies-event-info [event]="event" readOnly />
                        } @else {
                          <span class="text-red font-semibold">
                            There's no event scheduled for this turn 😳 Tell the
                            GM to get on it 😤
                          </span>
                        }
                      }
                      @case (RoundPhase.ChaosSpaceEvents) {
                        @if (vm.eventForThisRound; as event) {
                          <joshies-event-info [event]="event" readOnly />
                        } @else {
                          <span class="text-red font-semibold">
                            There's no event scheduled for this turn 😳 Tell the
                            GM to get on it 😤
                          </span>
                        }
                      }
                      @case (RoundPhase.Event) {
                        @if (vm.roundNumber < vm.numRounds) {
                          <p class="mt-0 mb-1">
                            Gameboard moves for turn
                            <strong>{{ vm.roundNumber + 1 | number }}</strong>
                            of <strong>{{ vm.numRounds }}</strong
                            >.
                          </p>

                          <p class="mt-0">Then, our next event:</p>

                          @if (vm.eventForNextRound; as event) {
                            <joshies-event-info [event]="event" readOnly />
                          } @else {
                            <span class="text-red font-semibold">
                              There's no event scheduled for this turn 😳 Tell
                              the GM to get on it 😤
                            </span>
                          }
                        } @else {
                          🏆 Awards Ceremony
                        }
                      }
                      @case (RoundPhase.WaitingForNextRound) {
                        @if (vm.roundNumber < vm.numRounds) {
                          <p class="mt-0 mb-1">
                            Gameboard moves for turn
                            <strong>{{ vm.roundNumber + 1 | number }}</strong>
                            of <strong>{{ vm.numRounds }}</strong
                            >.
                          </p>

                          <p class="mt-0">Then, our next event:</p>

                          @if (vm.eventForNextRound; as event) {
                            <joshies-event-info [event]="event" readOnly />
                          } @else {
                            <span class="text-red font-semibold">
                              There's no event scheduled for this turn 😳 Tell
                              the GM to get on it 😤
                            </span>
                          }
                        } @else {
                          Go home
                        }
                      }
                    }
                  </joshies-card>

                  <!-- Bank Balance -->
                  <joshies-card
                    headerText="Bank Balance"
                    headerIconClass="pi pi-building-columns text-primary mr-2"
                    readOnly
                    padded
                  >
                    <span class="font-semibold">
                      {{ vm.bankBalance | number }}
                    </span>
                    point{{ vm.bankBalance > 1 ? 's' : '' }}
                  </joshies-card>
                </div>
                <div class="col-4 ml-7">
                  <!-- Recent Duels -->
                  <joshies-card
                    headerText="Latest Duels"
                    headerIconClass="pi pi-bolt text-primary mr-2"
                    readOnly
                    padded
                  >
                    @if (vm.latestDuels.length; as numDuels) {
                      @if (numDuels > visibleDuels) {
                        <!-- numVisible logic keeps carousel from auto-scrolling when numVisible === container size -->
                        <p-carousel
                          [value]="vm.latestDuels"
                          [numVisible]="
                            vm.latestDuels.length === visibleDuels
                              ? visibleDuels + 1
                              : visibleDuels
                          "
                          [numScroll]="1"
                          [circular]="true"
                          [showIndicators]="false"
                          [showNavigators]="false"
                          autoplayInterval="5000"
                          orientation="vertical"
                          verticalViewPortHeight="28rem"
                        >
                          <ng-template let-duel pTemplate="item">
                            <table>
                              <tr>
                                <td>
                                  <joshies-duel-table-avatars
                                    [duel]="duel"
                                  ></joshies-duel-table-avatars>
                                </td>
                                <td class="pl-3">
                                  <h4 class="text-lg mb-0">
                                    {{ duel.winner?.display_name }} beat
                                    {{ duel.loser?.display_name }} at
                                    {{ duel.game_name }}
                                  </h4>
                                  <p class="mt-2">
                                    {{ duel.winner?.display_name }}
                                    took
                                    <strong>{{
                                      duel.points_gained_by_winner
                                    }}</strong>
                                    (<strong
                                      >{{ duel.wager_percentage }}%</strong
                                    >) of {{ duel.loser?.display_name }}'s
                                    points.
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </ng-template>
                        </p-carousel>
                      } @else {
                        <!-- Fixes the issue of carousel going blank when container size decreases to equal numVisible -->
                        <div class="w-full flex flex-column h-28rem">
                          @for (duel of vm.latestDuels; track duel.id) {
                            <div
                              class="
                              flex-1"
                            >
                              <table>
                                <tr>
                                  <td>
                                    <joshies-duel-table-avatars
                                      [duel]="duel"
                                    ></joshies-duel-table-avatars>
                                  </td>
                                  <td class="pl-3">
                                    <h4 class="text-lg mb-0">
                                      {{ duel.winner?.display_name }} beat
                                      {{ duel.loser?.display_name }} at
                                      {{ duel.game_name }}
                                    </h4>
                                    <p class="mt-2">
                                      {{ duel.winner?.display_name }}
                                      took
                                      <strong>{{
                                        duel.points_gained_by_winner
                                      }}</strong>
                                      (<strong
                                        >{{ duel.wager_percentage }}%</strong
                                      >) of {{ duel.loser?.display_name }}'s
                                      points.
                                    </p>
                                  </td>
                                </tr>
                              </table>
                            </div>
                          }
                        </div>
                      }
                    } @else {
                      <div class="font-italic h-28rem">
                        Well this is boring, there are no recent duels.
                      </div>
                    }
                  </joshies-card>
                </div>
              }
            </div>
          </div>
          <!-- Open Bets -->
          <div class="sticky" style="bottom: 5%;">
            <joshies-card
              class="ticker"
              headerText="Open Bets"
              headerIconClass="pi pi-money-bill text-primary mr-2"
              readOnly
              padded
            >
              @if (vm.activeBets.length; as numBets) {
                @if (numBets > visibleBets) {
                  <!-- numVisible logic keeps carousel from auto-scrolling when numVisible === container size -->
                  <p-carousel
                    [value]="vm.activeBets"
                    [numVisible]="
                      vm.activeBets.length === visibleBets
                        ? visibleBets + 1
                        : visibleBets
                    "
                    [numScroll]="1"
                    [circular]="true"
                    [showIndicators]="false"
                    [showNavigators]="false"
                    autoplayInterval="5000"
                  >
                    <ng-template let-bet pTemplate="item">
                      <joshies-bet [bet]="bet"></joshies-bet>
                    </ng-template>
                  </p-carousel>
                } @else {
                  <!-- Fixes the issue of carousel going blank when container size decreases to equal numVisible -->
                  <div class="w-full flex flex-row ">
                    @for (bet of vm.activeBets; track bet.id) {
                      <joshies-bet class="flex-1" [bet]="bet"></joshies-bet>
                    }
                  </div>
                }
              } @else {
                <span class="font-italic"
                  >Seriously? No open bets? It's not even real money.</span
                >
              }
            </joshies-card>
          </div>
        </div>
      }
    } @else {
      <p-skeleton height="2.25rem" />
    }
  `,
  styles: `
    .ticker ::ng-deep {
      > div {
        max-height: 10rem;
        min-height: 8rem;
        overflow: hidden;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DashboardPageComponent {
  private readonly sessionService = inject(SessionService);
  private readonly playerService = inject(PlayerService);
  private readonly gameStateService = inject(GameStateService);
  private readonly authService = inject(AuthService);
  private readonly gameboardService = inject(GameboardService);
  private readonly duelService = inject(DuelService);
  private readonly eventService = inject(EventService);
  private readonly betService = inject(BetService);

  private readonly showRankingsTable = computed(
    () => this.gameStateService.sessionStatus() !== SessionStatus.NotStarted,
  );

  private readonly rankingsTableHeader = computed(() =>
    this.gameStateService.sessionIsInProgress()
      ? 'Current Rankings'
      : 'Final Results',
  );

  // TODO - put this in the gameStateService because it's also used on the home page
  private readonly specialSpaceEvents = toSignal(
    this.gameStateService.roundPhase$.pipe(
      switchMap((roundPhase) =>
        roundPhase === RoundPhase.SpecialSpaceEvents
          ? this.gameboardService.nonCanceledSpecialSpaceEventsForThisTurn$
          : of(null),
      ),
    ),
  );

  // TODO - put this in the gameStateService because it's also used on the home page
  private readonly duels = toSignal(
    this.gameStateService.roundPhase$.pipe(
      switchMap((roundPhase) =>
        roundPhase === RoundPhase.Duels
          ? this.duelService.nonCanceledDuelsForThisTurn$
          : of(null),
      ),
    ),
  );

  // TODO: delete this comment, it's here to have something to commit to build this branch in Cloudflare
  private readonly allDuels = toSignal(this.duelService.duels$);

  readonly visibleDuels: number = 4;

  private readonly latestDuels = computed(() => {
    const completedDuels = this.allDuels()
      ?.filter(
        (duel) =>
          duel.status === DuelStatus.ChallengerWon ||
          duel.status === DuelStatus.OpponentWon,
      )
      .map((duel) => ({
        ...duel,
        winner:
          duel.status === DuelStatus.ChallengerWon
            ? duel.challenger
            : duel.opponent,
        loser:
          duel.status === DuelStatus.ChallengerWon
            ? duel.opponent
            : duel.challenger,
      }))
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      );

    // TODO: get rid of magic number and add slider or other input for duel history size
    return (completedDuels?.length ?? 0) > 20
      ? completedDuels?.slice(0, 20)
      : completedDuels;
  });

  // TODO - put this in the gameStateService because it's also used on the home page
  readonly chaosSpaceEvents = toSignal(
    this.gameStateService.roundPhase$.pipe(
      switchMap((roundPhase) =>
        roundPhase === RoundPhase.ChaosSpaceEvents
          ? this.gameboardService.nonCanceledChaosSpaceEventsForThisTurn$
          : of(null),
      ),
    ),
  );

  private readonly allBets = toSignal(this.betService.allBetsForThisSession$);

  private readonly activeBets = computed(() =>
    this.allBets()?.filter((bet) => bet.status === BetStatus.Active),
  );

  readonly visibleBets: number = 5;

  readonly viewModel = computed(() =>
    undefinedUntilAllPropertiesAreDefined({
      session: this.sessionService.session(),
      countdown: this.sessionService.countdown(),
      players: [...(this.playerService.players() ?? [])],
      sessionIsInProgress: this.gameStateService.sessionIsInProgress(),
      showRankingsTable: this.showRankingsTable(),
      rankingsTableHeader: this.rankingsTableHeader(),
      userId: this.authService.user()?.id,
      bankBalance: this.sessionService.session()?.bank_balance,
      roundPhase: this.gameStateService.roundPhase(),
      roundNumber: this.gameStateService.roundNumber(),
      numRounds: this.sessionService.session()?.num_rounds,
      specialSpaceEvents: this.specialSpaceEvents(),
      duels: this.duels(),
      chaosSpaceEvents: this.chaosSpaceEvents(),
      eventForThisRound: this.eventService.eventForThisRound(),
      eventForNextRound: this.eventService.eventForNextRound(),
      activeBets: this.activeBets(),
      latestDuels: this.latestDuels(),
    }),
  );

  protected readonly RoundPhase = RoundPhase;
  protected readonly GameboardSpaceEffect = GameboardSpaceEffect;
}
