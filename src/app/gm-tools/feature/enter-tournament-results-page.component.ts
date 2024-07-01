import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { TableModule } from 'primeng/table';
import { NgOptimizedImage } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';
import { SkeletonModule } from 'primeng/skeleton';
import { EventService } from '../../shared/data-access/event.service';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { TournamentBracketComponent } from '../../shared/ui/tournament-bracket.component';

@Component({
  selector: 'joshies-enter-tournament-results-page',
  standalone: true,
  template: `
    <joshies-page-header headerText="Enter Tournament Results" alwaysSmall>
      <joshies-header-link
        text="GM Tools"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (eventForThisRound(); as event) {
      <joshies-tournament-bracket [eventId]="event.id" [hasSubmit]="true" />
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
    FormsModule,
    TournamentBracketComponent,
  ],
})
export default class EnterTournamentResultsPageComponent {
  private readonly eventService = inject(EventService);

  private readonly teams = this.eventService.eventTeamsWithParticipantInfo;
  readonly eventForThisRound = this.eventService.eventForThisRound;

  readonly eventTeams = computed(() => {
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
}
