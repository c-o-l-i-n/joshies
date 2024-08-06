import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { SessionService } from '../../shared/data-access/session.service';
import {
  showErrorMessage,
  showSuccessMessage,
} from '../../shared/util/message-helpers';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { showMessageOnError } from '../../shared/util/supabase-helpers';
import { Router } from '@angular/router';

@Component({
  selector: 'joshies-end-session-page',
  standalone: true,
  imports: [PageHeaderComponent, HeaderLinkComponent, ButtonModule],
  template: `
    <joshies-page-header headerText="End Session" alwaysSmall>
      <joshies-header-link
        text="GM Tools"
        chevronDirection="left"
        routerLink=".."
      />
    </joshies-page-header>

    <p-button
      (onClick)="endSession()"
      label="End Session"
      severity="danger"
      styleClass="w-full"
      class="block mt-6 pt-6"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EndSessionPageComponent {
  private readonly sessionService = inject(SessionService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);

  async endSession(): Promise<void> {
    const confirmationPassword = 'END SESSION';
    const response = prompt(
      `End session? Type ${confirmationPassword} below to end this session.`,
    );

    if (response === null) {
      return;
    }

    if (response !== confirmationPassword) {
      showErrorMessage(
        `You didn't enter ${confirmationPassword}, dummy`,
        this.messageService,
      );
      return;
    }

    this.submitting.set(true);

    const { error } = await showMessageOnError(
      this.sessionService.endSession(),
      this.messageService,
    );

    if (error) {
      this.submitting.set(false);
      return;
    }

    showSuccessMessage('Session ended', this.messageService);
    this.router.navigate(['/']);
  }
}
