import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { TableModule } from 'primeng/table';
import { NgOptimizedImage } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';
import { SkeletonModule } from 'primeng/skeleton';
import { EventService } from '../../shared/data-access/event.service';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { confirmBackendAction } from '../../shared/util/dialog-helpers';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'joshies-enter-event-scores-page',
  standalone: true,
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    TableModule,
    NgOptimizedImage,
    ButtonModule,
    RouterLink,
    StronglyTypedTableRowDirective,
    SkeletonModule,
    AvatarModule,
    AvatarGroupModule,
    InputNumberModule,
    FormsModule,
  ],
  template: `
    <joshies-page-header headerText="Enter Event Scores" alwaysSmall>
      <joshies-header-link
        text="GM Tools"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    <p class="mt-5">
      Enter event scores for each team.
      {{
        eventForThisRound()?.lower_scores_are_better
          ? 'Lower scores are better.'
          : ''
      }}
    </p>

    @if (eventTeams(); as teams) {
      <p-table [value]="teams" [scrollable]="true">
        <ng-template pTemplate="header">
          <tr>
            <th>Team</th>
            <th>Pos</th>
            <th>Score</th>
          </tr>
        </ng-template>
        <ng-template
          pTemplate="body"
          [joshiesStronglyTypedTableRow]="teams"
          let-team
        >
          <tr>
            <td>
              <div class="flex align-items-center gap-2">
                {{ team.seed }}
                <p-avatarGroup styleClass="mr-2">
                  @for (
                    participant of team.participants;
                    track participant.participant_id
                  ) {
                    <p-avatar
                      [image]="participant.avatar_url"
                      size="large"
                      shape="circle"
                    />
                  }
                </p-avatarGroup>
              </div>
            </td>
            <td>
              {{ team.position }}
            </td>
            <td>
              <p-inputNumber
                [(ngModel)]="team.score"
                [showButtons]="true"
                buttonLayout="horizontal"
                [step]="1"
                [allowEmpty]="false"
                incrementButtonIcon="pi pi-plus"
                decrementButtonIcon="pi pi-minus"
                inputStyleClass="w-full font-semibold text-right"
                class="w-full"
                styleClass="w-full"
                (ngModelChange)="calculatePositions()"
              />
            </td>
          </tr>
        </ng-template>
      </p-table>

      <!-- Submit Button -->
      <p-button
        label="Submit Bet"
        styleClass="w-full mt-2"
        (onClick)="confirmSubmit()"
        [loading]="submitting()"
      />
    } @else {
      <p-skeleton height="30rem" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EnterEventScoresPageComponent {
  private readonly eventService = inject(EventService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly teams = this.eventService.eventTeamsWithParticipantInfo;
  readonly eventForThisRound = this.eventService.eventForThisRound;

  readonly submitting = signal<boolean>(false);

  readonly eventTeams = computed(() => {
    this.eventService.eventForThisRound()?.lower_scores_are_better;
    return this.teams()
      ?.filter(
        (team) =>
          team.event_id ===
          (this.eventService.eventForThisRound()?.id ?? false),
      )
      .map((team) => {
        return { ...team, score: 0, position: 1 };
      });
  });

  calculatePositions() {
    const eventTeams = this.eventTeams() ?? [];
    const scores = eventTeams.map((team) => team.score) ?? [];
    const sortAsc = function (a: number, b: number) {
      return a - b;
    };
    const sortDesc = function (a: number, b: number) {
      return b - a;
    };
    const sortFunc = this.eventService.eventForThisRound()
      ?.lower_scores_are_better
      ? sortAsc
      : sortDesc;
    scores.sort(sortFunc);
    eventTeams.forEach((team) => {
      const position =
        1 + (scores.findIndex((score) => team.score === score) ?? -1);
      if (position > 0) {
        team.position = position;
      }
    });
  }

  confirmSubmit() {
    this.calculatePositions();
    const teamScores =
      this.eventTeams()?.map((team) => {
        return {
          team_id: team.id,
          score: team.score,
          position: team.position,
        };
      }) ?? [];

    confirmBackendAction({
      action: async () =>
        this.eventService.submitEventScores(
          this.eventService.eventForThisRound()?.id ?? -1,
          teamScores,
        ),
      confirmationMessageText: `Are you sure you want to submit these scores?`,
      successMessageText: 'Event scores submitted',
      submittingSignal: this.submitting,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: '..',
      activatedRoute: this.activatedRoute,
      router: this.router,
    });
  }
}
