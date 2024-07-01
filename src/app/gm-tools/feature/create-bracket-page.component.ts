import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { TournamentBracketComponent } from '../../shared/ui/tournament-bracket.component';
import { EventService } from '../../shared/data-access/event.service';
import { DropdownModule } from 'primeng/dropdown';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'joshies-create-bracket-page',
  standalone: true,
  template: `
    <joshies-page-header headerText="Bracket Test Page" alwaysSmall>
      <joshies-header-link
        text="GM Tools"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>
    <div class="flex flex-column mt-5 font-semibold">
      @if (events(); as events) {
        <p-dropdown
          [options]="events"
          [(ngModel)]="selectedEventId"
          optionValue="id"
          optionLabel="name"
          placeholder="Select an Event"
          styleClass=" w-full"
        />

        @if (selectedEventId(); as selectedEventId) {
          <joshies-tournament-bracket
            [eventId]="selectedEventId"
            [hasSubmit]="true"
          />
        } @else {
          <p class="font-normal">Select an event to view its bracket here</p>
        }
      } @else if (events === null) {
        <p class="mt-6 pt-6 text-center text-500 font-italic">
          No active session
        </p>
      } @else {
        <p-skeleton height="2rem" styleClass="mt-5" />
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    ButtonModule,
    FormsModule,
    InputNumberModule,
    TournamentBracketComponent,
    DropdownModule,
    SkeletonModule,
  ],
})
export default class CreateBracketPageComponent {
  private readonly eventService = inject(EventService);

  readonly events = this.eventService.events;
  readonly selectedEventId = signal<number | null>(null);
}
