import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  inject,
  signal,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { FormBuilder } from '@angular/forms';
import { ModelFormGroup } from '../../shared/util/form-helpers';
import { Form, FormComponent } from '../../shared/ui/form.component';
import { SessionService } from '../../shared/data-access/session.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { EventForm, eventFormFactory } from '../util/event-form';
import { EventService } from '../../shared/data-access/event.service';

@Component({
  selector: 'joshies-new-event-page',
  standalone: true,
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    FormComponent,
    ConfirmDialogModule,
  ],
  template: `
    <!-- Header -->
    <joshies-page-header headerText="New Event" alwaysSmall>
      <joshies-header-link
        text="Back"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    <!-- Form -->
    <joshies-form [form]="form" class="block mt-5" />

    <!-- Confirm Dialog -->
    <p-confirmDialog styleClass="mx-3" [key]="confirmDialogKey">
      <ng-template pTemplate="message">
        <div class="block">
          <p class="mt-0 mb-4">Are you sure you want to create this event?</p>
        </div>
      </ng-template>
    </p-confirmDialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NewEventPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly sessionService = inject(SessionService);
  private readonly messageService = inject(MessageService);
  private readonly gameStateService = inject(GameStateService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly eventService = inject(EventService);

  readonly confirmDialogKey = 'create-event';

  readonly submitting = signal(false);

  readonly form: Form;
  readonly formGroup: ModelFormGroup<EventForm>;
  readonly eventFormValue: Signal<EventForm>;

  constructor() {
    ({
      eventForm: this.form,
      eventFormGroup: this.formGroup,
      eventFormValue: this.eventFormValue,
    } = eventFormFactory(
      async (event) => this.eventService.createEvent(event),
      `Create Event`,
      (name) => `${name} event created`,
      this.formBuilder,
      this.submitting,
      this.submitting,
      this.confirmDialogKey,
      this.gameStateService,
      this.router,
      this.activatedRoute,
      this.confirmationService,
      this.messageService,
      this.eventService,
    ));
  }
}