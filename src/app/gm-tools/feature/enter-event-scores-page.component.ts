import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
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
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { confirmBackendAction } from '../../shared/util/dialog-helpers';
import { ConfirmationService, MessageService } from 'primeng/api';
import { undefinedUntilAllPropertiesAreDefined } from '../../shared/util/signal-helpers';
import { ParticipantListPipe } from '../../shared/ui/participant-list.pipe';

@Component({
  selector: 'joshies-enter-event-scores-page',
  standalone: true,
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

    @if (viewModel(); as vm) {
      <p-table
        [value]="vm.teams!"
        [scrollable]="true"
        [formGroup]="vm.formGroup"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>Team</th>
            <th>Pos</th>
            <th>Score</th>
          </tr>
        </ng-template>
        <ng-template
          pTemplate="body"
          [joshiesStronglyTypedTableRow]="vm.teams!"
          let-team
        >
          <tr>
            <td>
              <div class="flex flex-column align-items-center gap-2">
                <div class="flex flex-row align-items-center gap-2">
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
                <div class="text-xs">
                  {{ team.participants | participantList }}
                </div>
              </div>
            </td>
            <td>
              {{ positions[team.id] }}
            </td>
            <td>
              <p-inputNumber
                [formControlName]="team.id"
                [showButtons]="true"
                buttonLayout="horizontal"
                [step]="1"
                [allowEmpty]="false"
                incrementButtonIcon="pi pi-plus"
                decrementButtonIcon="pi pi-minus"
                inputStyleClass="w-full font-semibold text-right"
                class="w-full"
                styleClass="w-full"
                chan
                (ngModelChange)="calculatePositions()"
              />
            </td>
          </tr>
        </ng-template>
      </p-table>

      <!-- Submit Button -->
      <p-button
        label="Submit Event Scores"
        styleClass="w-full mt-2"
        (onClick)="confirmSubmit()"
        [loading]="submitting()"
      />
    } @else {
      <p-skeleton height="30rem" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    ReactiveFormsModule,
    ParticipantListPipe,
  ],
})
export default class EnterEventScoresPageComponent implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  private readonly teams = this.eventService.eventTeamsWithParticipantInfo;
  readonly eventForThisRound = this.eventService.eventForThisRound;

  positions: Record<number, number> = {};

  readonly submitting = signal<boolean>(false);

  readonly eventTeams = computed(() => {
    return this.teams()?.filter(
      (team) =>
        team.event_id === (this.eventService.eventForThisRound()?.id ?? false),
    );
  });

  readonly formGroup = computed(() => {
    return this.formBuilder.nonNullable.group(
      this.eventTeams()?.reduce(
        (prev, team) => ({
          ...prev,
          [team.id]: [0, Validators.required],
        }),
        {},
      ) ?? [],
    );
  });

  readonly viewModel = computed(() =>
    undefinedUntilAllPropertiesAreDefined({
      formGroup: this.formGroup(),
      teams: this.eventTeams(),
    }),
  );

  calculatePositions() {
    const eventTeams = this.eventTeams() ?? [];

    let scores: number[] = [];
    const formGroup = this.formGroup();
    this.eventTeams()?.forEach((team) => {
      scores = [...scores, formGroup?.get([team.id])?.value];
    });

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
      const teamScore: number = this.formGroup().get([team.id])?.value;
      const position =
        1 + (scores.findIndex((score) => teamScore === score) ?? -1);
      if (position > 0) {
        this.positions = { ...this.positions, [team.id]: position };
      }
    });
  }

  confirmSubmit() {
    this.calculatePositions();
    const teamScores =
      this.eventTeams()?.map((team) => {
        return {
          team_id: team.id,
          score: this.formGroup()?.get([team.id])?.value ?? 0,
        };
      }) ?? [];

    confirmBackendAction({
      action: async () => this.eventService.submitEventScores(teamScores),
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

  constructor() {
    // This handles first time loads and refreshes
    effect(() => {
      this.eventTeams();
      this.formGroup();
      this.calculatePositions();
    });
  }

  ngOnInit(): void {
    // This handles revisiting the page
    this.calculatePositions();
  }
}
