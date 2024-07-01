import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { Router } from '@angular/router';
import { DecimalPipe, KeyValuePipe, NgOptimizedImage } from '@angular/common';
import { TableModule } from 'primeng/table';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { SessionService } from '../../shared/data-access/session.service';
import { undefinedUntilAllPropertiesAreDefined } from '../../shared/util/signal-helpers';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import {
  LocalStorageRecord,
  getRecordFromLocalStorage,
  removeRecordFromLocalStorage,
} from '../../shared/util/local-storage-helpers';
import { MessageService } from 'primeng/api';
import { showSuccessMessage } from '../../shared/util/message-helpers';
import {
  showMessageOnError,
  trackByPlayerId,
} from '../../shared/util/supabase-helpers';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';
import { NumberWithSignAndColorPipe } from '../../shared/ui/number-with-sign-and-color.pipe';
import { EventService } from '../../shared/data-access/event.service';

@Component({
  selector: 'joshies-review-score-changes-page',
  standalone: true,
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    TableModule,
    KeyValuePipe,
    NgOptimizedImage,
    SkeletonModule,
    ButtonModule,
    DecimalPipe,
    StronglyTypedTableRowDirective,
    NumberWithSignAndColorPipe,
  ],
  template: `
    <joshies-page-header headerText="Review Score Changes" alwaysSmall>
      <joshies-header-link
        text="Edit"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (viewModel(); as vm) {
      <h4 class="mt-6">
        Score changes for round {{ vm.roundNumber }} of {{ vm.numRounds }}
        <span class="text-500 font-italic">(Draft)</span>
      </h4>

      <p-table
        [value]="vm.players"
        [defaultSortOrder]="-1"
        sortField="new_score"
        [sortOrder]="-1"
        [scrollable]="true"
        [rowTrackBy]="trackByPlayerId"
      >
        <ng-template pTemplate="header">
          <tr>
            <th pFrozenColumn>Player</th>
            <th class="text-right">Before</th>
            <th class="text-right">Change</th>
            <th class="text-right">After</th>
          </tr>
        </ng-template>
        <ng-template
          pTemplate="body"
          [joshiesStronglyTypedTableRow]="vm.players"
          let-player
        >
          <tr>
            <!-- Player -->
            <td pFrozenColumn>
              <div class="flex align-items-center gap-2 -py-2">
                <img
                  [ngSrc]="player.avatar_url"
                  alt=""
                  width="32"
                  height="32"
                  class="border-circle surface-100"
                />
                {{ player.display_name }}
              </div>
            </td>
            <!-- Before -->
            <td class="text-right text-400">
              {{ player.score | number }}
            </td>
            <!-- Change -->
            <td
              class="text-right"
              [innerHTML]="player.change | numberWithSignAndColor"
            ></td>
            <!-- After -->
            <td class="text-right font-semibold">
              {{ player.new_score | number }}
            </td>
          </tr>
        </ng-template>
      </p-table>

      <p-button
        [label]="'Submit Scores for Round ' + vm.roundNumber"
        (onClick)="
          submitPlayerScoreChanges(vm.roundNumber!, vm.teamScoreChanges)
        "
        severity="success"
        styleClass="mt-4 w-full"
        [loading]="submittingInProgress()"
      />
    } @else {
      <p-skeleton height="30rem" styleClass="mt-6" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ReviewScoreChangesPageComponent {
  private readonly router = inject(Router);
  private readonly gameStateService = inject(GameStateService);
  private readonly sessionService = inject(SessionService);
  private readonly messageService = inject(MessageService);
  private readonly eventService = inject(EventService);

  protected readonly trackByPlayerId = trackByPlayerId;

  private readonly teamScoreChanges: Record<string, number> =
    getRecordFromLocalStorage(LocalStorageRecord.RoundScoreFormValue);

  readonly databaseEventTeams = computed(() =>
    this.eventService
      .eventTeams()
      ?.filter(
        (eventTeam) =>
          eventTeam.event_id === this.eventService.eventForThisRound()?.id,
      )
      ?.sort((a, b) => (a.seed ?? 0) - (b.seed ?? 0)),
  );

  private readonly players = computed(() => {
    let participants = this.eventService.eventParticipantsWithPlayerInfo();
    participants = participants?.filter((eventParticipant) =>
      this.databaseEventTeams()
        ?.map((eventTeam) => eventTeam.id)
        .includes(eventParticipant.team_id),
    );
    return participants?.map((player) => ({
      ...player,
      change: this.teamScoreChanges[player.team_id],
      new_score: player.score + this.teamScoreChanges[player.team_id],
    }));
  });

  readonly viewModel = computed(() =>
    undefinedUntilAllPropertiesAreDefined({
      players: this.players(),
      roundNumber: this.gameStateService.roundNumber(),
      numRounds: this.sessionService.session()?.num_rounds,
      teamScoreChanges: this.teamScoreChanges,
    }),
  );

  readonly submittingInProgress = signal(false);

  async submitPlayerScoreChanges(
    roundNumber: number,
    teamScoreChanges: Record<string, number>,
  ): Promise<void> {
    this.submittingInProgress.set(true);

    const { error } = await showMessageOnError(
      this.sessionService.endRound(roundNumber, teamScoreChanges),
      this.messageService,
    );

    if (error) {
      this.submittingInProgress.set(false);
      return;
    }

    removeRecordFromLocalStorage(LocalStorageRecord.RoundScoreFormValue);
    showSuccessMessage('Scores saved successfully!', this.messageService);
    this.router.navigate(['/']);
  }
}
