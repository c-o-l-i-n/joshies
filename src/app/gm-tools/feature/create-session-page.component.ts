import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  FormField,
  FormFieldType,
} from '../../shared/ui/form-field/form-field.component';
import { Form, FormComponent } from '../../shared/ui/form.component';
import { withAllDefined } from '../../shared/util/signal-helpers';
import { UserService } from '../../shared/data-access/user.service';
import { SkeletonModule } from 'primeng/skeleton';
import { SessionService } from '../../shared/data-access/session.service';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { Router } from '@angular/router';

@Component({
  selector: 'joshies-create-session-page',
  standalone: true,
  imports: [
    FormComponent,
    SkeletonModule,
    PageHeaderComponent,
    HeaderLinkComponent,
  ],
  template: `
    <!-- Header -->
    <joshies-page-header headerText="Create Session" alwaysSmall>
      <joshies-header-link
        text="GM Tools"
        chevronDirection="left"
        routerLink=".."
      />
    </joshies-page-header>

    @if (form.fields()) {
      <!-- Form -->
      <joshies-form [form]="form" class="block mt-5" />
    } @else {
      <!-- Loading Skeleton -->
      <div class="h-4rem"></div>
      <p-skeleton height="2.25rem" styleClass="mb-4" />
      <p-skeleton width="100%" height="19rem" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CreateSessionPageComponent {
  private readonly userService = inject(UserService);
  private readonly sessionService = inject(SessionService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly allUsers = toSignal(this.userService.allUsers$);
  readonly creatingSession = signal(false);

  readonly formGroup = this.formBuilder.nonNullable.group({
    sessionName: ['', Validators.required],
    dateRange: [
      [new Date(), new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)],
      Validators.required,
    ],
    startTime: [new Date(), Validators.required],
    playerUserIds: [[] as string[], Validators.required],
    numRounds: [10, Validators.required],
  });

  private readonly numPlayersSelected = toSignal(
    this.formGroup.controls.playerUserIds.valueChanges.pipe(
      map((players) => players.length),
    ),
    { initialValue: 0 },
  );

  readonly form: Form = {
    formGroup: this.formGroup,
    onSubmit: () => this.createSession(),
    disabled: this.creatingSession,
    fields: computed(() =>
      withAllDefined(
        { allUsers: this.allUsers() },
        ({ allUsers }): FormField[] => [
          {
            name: 'session-name',
            label: 'Session Name',
            placeholder: 'Session Name',
            type: FormFieldType.Text,
            control: this.formGroup.controls.sessionName,
          },
          {
            label: 'Date Range',
            name: 'date-range',
            placeholder: 'Date Range',
            type: FormFieldType.Calendar,
            minDate: new Date(),
            selectionMode: 'range',
            touchUi: true,
            control: this.formGroup.controls.dateRange,
          },
          {
            label: 'Start Time (for countdown clock)',
            name: 'start-time',
            placeholder: 'Start Time',
            type: FormFieldType.Calendar,
            touchUi: true,
            showTime: true,
            timeOnly: true,
            control: this.formGroup.controls.startTime,
          },
          {
            label: 'Number of Rounds',
            name: 'num-rounds',
            placeholder: 'Number of Rounds',
            type: FormFieldType.Number,
            min: 1,
            max: 100,
            showButtons: true,
            control: this.formGroup.controls.numRounds,
          },
          {
            label: `Players (${this.numPlayersSelected()})`,
            name: 'players',
            placeholder: 'Players',
            type: FormFieldType.MultiSelect,
            options: allUsers,
            optionLabel: 'display_name',
            optionValue: 'id',
            useChips: true,
            control: this.formGroup.controls.playerUserIds,
          },
          {
            name: 'submit',
            label: 'Create Session',
            type: FormFieldType.Submit,
            position: 'full',
            loading: this.creatingSession(),
          },
        ],
      ),
    ),
  };

  private async createSession(): Promise<void> {
    this.creatingSession.set(true);

    const formValue = this.formGroup.getRawValue();

    const { sessionName, numRounds, playerUserIds, startTime } = formValue;

    const startDate = formValue.dateRange[0];
    const endDate = formValue.dateRange[1];

    // set the startDate's time to startTime
    startDate.setHours(startTime.getHours(), startTime.getMinutes(), 0);

    // fix time zones
    startDate.setMinutes(
      startDate.getMinutes() - startDate.getTimezoneOffset(),
    );
    endDate.setMinutes(endDate.getMinutes() - endDate.getTimezoneOffset());

    const { error } = await this.sessionService.createSession(
      sessionName,
      startDate,
      endDate,
      numRounds,
      playerUserIds,
    );

    if (error) {
      this.creatingSession.set(false);
      return;
    }

    this.router.navigate(['/']);
  }
}
