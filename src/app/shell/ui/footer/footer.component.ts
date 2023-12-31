import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FooterLinkComponent,
  FooterLinkModel,
} from '../footer-link/footer-link.component';

@Component({
  selector: 'joshies-footer',
  standalone: true,
  imports: [CommonModule, FooterLinkComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  @Input({ required: true }) footerLinks!: FooterLinkModel[];
}
