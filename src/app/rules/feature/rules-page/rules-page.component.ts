import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RulesService } from '../../data-access/rules.service';
import { SkeletonModule } from 'primeng/skeleton';
import {
  FormBuilder,
  FormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Form, FormComponent } from '../../../shared/ui/form.component';
import {
  FormField,
  FormFieldType,
} from '../../../shared/ui/form-field/form-field.component';
import { SessionService } from '../../../shared/data-access/session.service';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { FooterService } from '../../../shared/data-access/footer.service';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { pagePaddingXCssClass } from '../../../shared/util/css-helpers';
import { PlayerService } from '../../../shared/data-access/player.service';
import { undefinedUntilAllPropertiesAreDefined } from '../../../shared/util/signal-helpers';
import { EventService } from '../../../shared/data-access/event.service';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { CardComponent } from '../../../shared/ui/card.component';
import { GameboardService } from '../../../shared/data-access/gameboard.service';
import { GameboardSpaceComponent } from '../../../gm-tools/ui/gameboard-space.component';
import { GameboardSpaceDescriptionPipe } from '../../../gm-tools/ui/gameboard-space-description.pipe';
import { toSignal } from '@angular/core/rxjs-interop';

function valueIsNot(invalidValue: string): ValidatorFn {
  return (control) =>
    control.value === invalidValue
      ? { invalidValue: `Value is invalid` }
      : null;
}

@Component({
  selector: 'joshies-rules-page',
  standalone: true,
  templateUrl: './rules-page.component.html',
  host: {
    class: 'block pb-6',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    SkeletonModule,
    FormsModule,
    FormComponent,
    ButtonModule,
    ConfirmDialogModule,
    NgClass,
    RouterLink,
    RouterLinkActive,
    NgOptimizedImage,
    CardComponent,
    GameboardSpaceComponent,
    GameboardSpaceDescriptionPipe,
  ],
})
export default class RulesPageComponent {
  private readonly rulesService = inject(RulesService);
  private readonly sessionService = inject(SessionService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly playerService = inject(PlayerService);
  private readonly eventService = inject(EventService);
  private readonly gameboardService = inject(GameboardService);
  private readonly footerService = inject(FooterService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  private readonly rules = this.rulesService.rules;

  private readonly editMode = signal(false);
  private readonly savingRules = signal(false);

  private readonly formGroup = computed(() =>
    this.formBuilder.nonNullable.group({
      rules: [
        this.rules() ?? '',
        [Validators.required, valueIsNot(this.rules() ?? '')],
      ],
    }),
  );

  private readonly form = computed(
    (): Form => ({
      formGroup: this.formGroup(),
      onSubmit: () => this.saveRules(),
      disabled: this.savingRules,
      fields: computed((): FormField[] => [
        {
          name: 'rules',
          label: '',
          placeholder: 'Enter Rules Here',
          type: FormFieldType.Editor,
          control: this.formGroup().controls.rules,
        },
        {
          name: 'submit',
          label: 'Save Rules',
          type: FormFieldType.Submit,
          position: 'full',
          loading: this.savingRules(),
        },
      ]),
    }),
  );

  private readonly disableFooterEffect = effect(
    () =>
      this.editMode()
        ? this.footerService.enableFooter()
        : this.footerService.disableFooter(),
    { allowSignalWrites: true },
  );

  private readonly scrollToAnchorAfterRulesLoad = effect(() => {
    this.rules();
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      skipLocationChange: true,
      preserveFragment: true,
    });
  });

  readonly specialSpaceEvents = toSignal(
    this.gameboardService.specialSpaceEventTemplates$,
  );
  readonly chaosSpaceEvents = toSignal(
    this.gameboardService.chaosSpaceEventTemplates$,
  );

  readonly pagePaddingXCssClass = pagePaddingXCssClass;

  readonly viewModel = computed(() =>
    undefinedUntilAllPropertiesAreDefined({
      editMode: this.editMode(),
      userIsGameMaster: this.playerService.userIsGameMaster(),
      rules: this.rules(),
      form: this.form(),
      events: this.eventService.events(),
      spaces: this.gameboardService.gameboardSpaces(),
      specialSpaceEvents: this.specialSpaceEvents(),
      chaosSpaceEvents: this.chaosSpaceEvents(),
    }),
  );

  private async saveRules(): Promise<void> {
    this.savingRules.set(true);

    const activeSessionId = this.sessionService.session()!.id;
    const rulesHtml = this.formGroup().getRawValue().rules;

    await this.rulesService.saveRules(activeSessionId, rulesHtml ?? '');

    this.savingRules.set(false);
    this.cancelChanges();
  }

  enterEditMode(): void {
    this.editMode.set(true);
  }

  cancelChanges(): void {
    this.editMode.set(false);
    this.formGroup().reset();
  }

  confirmCancel(): void {
    this.confirmationService.confirm({
      message:
        'Are you sure you want close the editor?  Any unsaved changes will be lost.',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => this.cancelChanges(),
    });
  }
}
