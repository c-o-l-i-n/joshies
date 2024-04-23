import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { PlayerService } from '../../shared/data-access/player.service';
import { undefinedUntilAllPropertiesAreDefined } from '../../shared/util/signal-helpers';
import { RankingsTableComponent } from '../../shared/ui/rankings-table.component';
import { SkeletonModule } from 'primeng/skeleton';
import { AuthService } from '../../auth/data-access/auth.service';

@Component({
  selector: 'joshies-current-rankings-page',
  standalone: true,
  imports: [
    HeaderLinkComponent,
    PageHeaderComponent,
    RankingsTableComponent,
    SkeletonModule,
  ],
  template: `
    <joshies-page-header headerText="Current Rankings" alwaysSmall>
      <joshies-header-link
        text="Analytics"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (viewModel(); as vm) {
      @if (vm.players; as players) {
        <!-- Rankings Table -->
        <joshies-rankings-table
          [players]="players"
          [userId]="vm.userId"
          class="block mt-5"
        />
      } @else {
        <p class="mt-6 pt-6 text-center text-500 font-italic">
          No active session
        </p>
      }
    } @else {
      <!-- Loading Skeleton -->
      <p-skeleton height="25rem" styleClass="mt-5" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CurrentRankingsPageComponent {
  private readonly playerService = inject(PlayerService);
  private readonly authService = inject(AuthService);

  readonly viewModel = computed(() =>
    undefinedUntilAllPropertiesAreDefined({
      players: this.playerService.players(),
      userId: this.authService.user()?.id,
    }),
  );
}
