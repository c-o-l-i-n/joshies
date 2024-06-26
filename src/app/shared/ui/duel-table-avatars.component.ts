import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  input,
} from '@angular/core';
import { DuelStatus } from '../util/supabase-helpers';
import { AvatarModule } from 'primeng/avatar';
import { DuelModel } from '../util/supabase-types';

@Component({
  selector: 'joshies-duel-table-avatars',
  standalone: true,
  imports: [AvatarModule],
  template: `
    <p-avatar
      [image]="duel().challenger!.avatar_url"
      shape="circle"
      class="relative"
    >
      @if (duel().status === DuelStatus.ChallengerWon) {
        <span class="-mt-3 absolute top-0">👑</span>
      }
    </p-avatar>

    <span class="text-sm text-600 mb-1">vs.</span>

    @if (duel().opponent; as opponent) {
      <p-avatar [image]="opponent.avatar_url" shape="circle" class="relative">
        @if (duel().status === DuelStatus.OpponentWon) {
          <span class="-mt-3 absolute top-0">👑</span>
        }
      </p-avatar>
    } @else {
      <i class="pi pi-question-circle text-4xl -mt-1 text-300"></i>
    }
  `,
  host: {
    class: 'flex align-items-center gap-2',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DuelTableAvatarsComponent {
  readonly duel = input.required<DuelModel>();

  @HostBinding('class') get class(): string {
    return [DuelStatus.ChallengerWon, DuelStatus.OpponentWon].includes(
      this.duel().status,
    )
      ? 'mt-3'
      : '';
  }

  protected readonly DuelStatus = DuelStatus;
}
