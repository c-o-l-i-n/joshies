import { Signal, WritableSignal, computed } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  FormField,
  FormFieldType,
} from '../../shared/ui/form-field/form-field.component';
import { confirmBackendAction } from '../../shared/util/dialog-helpers';
import {
  ModelFormGroup,
  formValueSignal,
} from '../../shared/util/form-helpers';
import { EventFormat } from '../../shared/util/supabase-helpers';
import { Form } from '../../shared/ui/form.component';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import {
  EventModel,
  OmitAutoGeneratedColumns,
} from '../../shared/util/supabase-types';

export interface EventForm {
  name: string;
  description: string;
  rules: string;
  teamSize: number;
  scoringMap: string;
  imageUrl: string;
  pointsLabel: string;
  lowerScoresAreBetter: boolean;
  format: EventFormat;
}

export function eventFormFactory(
  saveMethod: (
    event: OmitAutoGeneratedColumns<EventModel>,
  ) => Promise<PostgrestSingleResponse<null>>,
  submitButtonText: string,
  successText: (eventName: string) => string,
  formBuilder: FormBuilder,
  submittingSignal: WritableSignal<boolean>,
  formDisabledSignal: Signal<boolean>,
  confirmDialogKey: string,
  gameStateService: GameStateService,
  router: Router,
  activatedRoute: ActivatedRoute,
  confirmationService: ConfirmationService,
  messageService: MessageService,
): {
  eventForm: Form;
  eventFormGroup: ModelFormGroup<EventForm>;
  eventFormValue: Signal<EventForm>;
} {
  const eventFormGroup: ModelFormGroup<EventForm> =
    formBuilder.nonNullable.group({
      name: ['', Validators.required],
      description: [''],
      rules: [''],
      teamSize: [1, Validators.required],
      scoringMap: ['', Validators.required],
      imageUrl: ['', Validators.required],
      pointsLabel: ['points', Validators.required],
      lowerScoresAreBetter: [false, Validators.required],
      format: [EventFormat.ScoreBasedSingleRound, Validators.required],
    });

  const eventFormValue: Signal<EventForm> = formValueSignal(eventFormGroup);

  const eventForm = {
    formGroup: eventFormGroup,
    disabled: formDisabledSignal,
    fields: computed((): FormField[] => [
      {
        type: FormFieldType.Text,
        name: 'name',
        label: 'Name',
        placeholder: 'Event Name',
        control: eventFormGroup.controls.name,
      },
      {
        type: FormFieldType.TextArea,
        name: 'description',
        label: 'Description',
        placeholder: 'Event Description',
        control: eventFormGroup.controls.description,
      },
      {
        type: FormFieldType.TextArea,
        name: 'rules',
        label: 'Rules',
        placeholder: 'Event Rules',
        control: eventFormGroup.controls.rules,
      },
      {
        type: FormFieldType.Number,
        name: 'team-size',
        label: 'Team Size',
        showButtons: true,
        defaultValue: 1,
        min: 1,
        control: eventFormGroup.controls.teamSize,
      },
      {
        type: FormFieldType.TextArea,
        name: 'scoring-map',
        label: 'Scoring Map',
        defaultValue: '[30, 24, 18, 16, 14, 10, 8, 6, 4, 2]',
        control: eventFormGroup.controls.scoringMap,
      },
      {
        type: FormFieldType.Image,
        name: 'image',
        label: 'Image',
        control: eventFormGroup.controls.imageUrl,
        previewHeight: 100,
        previewWidth: 100,
        uploadCallback: (imageFile) => eventService.uploadImage(imageFile),
      },
      {
        type: FormFieldType.Text,
        name: 'points-label',
        label: 'Points Label',
        placeholder: 'points',
        defaultValue: 'points',
        control: eventFormGroup.controls.pointsLabel,
      },
      {
        type: FormFieldType.Checkbox,
        name: 'lower-scores-are-better',
        label: 'Lower Scores are Better',
        defaultValue: false,
        control: eventFormGroup.controls.lowerScoresAreBetter,
      },
      {
        type: FormFieldType.Dropdown,
        name: 'event-format',
        label: 'Event Format',
        placeholder: 'Event Format',
        options: [
          {
            label: 'Score-Based Single Round',
            value: EventFormat.ScoreBasedSingleRound,
          },
          {
            label: 'Single Elimination Tournament',
            value: EventFormat.SingleEliminationTournament,
          },
          {
            label: 'Double Elimination Tournament',
            value: EventFormat.DoubleEliminationTournament,
          },
        ],
        optionLabel: 'label',
        optionValue: 'value',
        control: eventFormGroup.controls.format,
      },
      {
        type: FormFieldType.Submit,
        name: 'submit',
        label: submitButtonText,
        loading: submittingSignal(),
        position: 'full',
      },
    ]),
    onSubmit: () =>
      confirmSubmit(
        eventFormValue(),
        gameStateService.sessionId()!,
        confirmDialogKey,
      ),
  };

  async function confirmSubmit(
    formValue: EventForm,
    sessionId: number,
    confirmDialogKey: string,
  ) {
    const {
      name,
      description,
      rules,
      teamSize,
      scoringMap,
      imageUrl,
      pointsLabel,
      lowerScoresAreBetter,
      format,
    } = formValue;

    confirmBackendAction({
      action: () =>
        saveMethod({
          name,
          description: description ?? null,
          rules: rules ?? null,
          team_size: teamSize,
          scoring_map: scoringMap as unknown as number[],
          image_url: imageUrl ?? null,
          points_label: pointsLabel,
          lower_scores_are_better: lowerScoresAreBetter,
          format,
          session_id: sessionId,
        }),
      successMessageText: successText(name),
      successNavigation: '..',
      confirmDialogKey,
      submittingSignal,
      router: router,
      activatedRoute: activatedRoute,
      confirmationService: confirmationService,
      messageService: messageService,
    });
  }

  return {
    eventForm,
    eventFormGroup,
    eventFormValue,
  };
}
