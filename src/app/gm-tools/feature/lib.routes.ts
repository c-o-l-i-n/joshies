import { Routes } from '@angular/router';
import { editGameboardSpaceTypeResolver } from '../data-access/edit-gameboard-space-type.resolver';
import { editSpecialSpaceEventTemplateResolver } from '../data-access/edit-special-space-event-template.resolver';
import { editChaosSpaceEventTemplateResolver } from '../data-access/edit-chaos-space-event-template.resolver';
import { editEventResolver } from '../data-access/edit-event.resolver';

const gmToolsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./gm-tools-page.component'),
    data: { pageAnimationLayer: 0 },
  },

  // round
  {
    path: 'end-round',
    loadComponent: () => import('./end-round-page.component'),
    data: { pageAnimationLayer: 1 },
  },
  {
    path: 'end-round/review',
    loadComponent: () => import('./review-score-changes-page.component'),
    data: { pageAnimationLayer: 2 },
  },
  {
    path: 'space-entry',
    loadComponent: () => import('./gameboard-space-entry-page.component'),
    data: { pageAnimationLayer: 1 },
  },
  {
    path: 'space-entry/review',
    loadComponent: () =>
      import('./review-gameboard-space-entry-page.component'),
    data: { pageAnimationLayer: 2 },
  },
  {
    path: 'resolve-special-space-events',
    loadComponent: () =>
      import('./resolve-special-space-events-page.component'),
    data: { pageAnimationLayer: 2 },
  },
  {
    path: 'resolve-special-space-events/:specialSpaceEventId',
    loadComponent: () => import('./special-space-event-page.component'),
    data: { pageAnimationLayer: 3 },
  },
  {
    path: 'special-space-event-templates',
    loadComponent: () =>
      import('./manage-special-space-event-templates-page.component'),
    data: { pageAnimationLayer: 2 },
  },
  {
    path: 'special-space-event-templates/new',
    loadComponent: () =>
      import('./new-special-space-event-template-page.component'),
    data: { pageAnimationLayer: 3 },
  },
  {
    path: 'special-space-event-templates/:specialSpaceEventTemplateId',
    loadComponent: () =>
      import('./edit-special-space-event-template-page.component'),
    data: { pageAnimationLayer: 3 },
    resolve: {
      originalSpecialSpaceEventTemplate: editSpecialSpaceEventTemplateResolver,
    },
  },
  {
    path: 'resolve-duels',
    loadComponent: () => import('./resolve-duels-page.component'),
    data: { pageAnimationLayer: 2 },
  },
  {
    path: 'resolve-duels/:duelId',
    loadComponent: () => import('./duel-page.component'),
    data: { pageAnimationLayer: 3 },
  },

  {
    path: 'resolve-chaos-space-events',
    loadComponent: () => import('./resolve-chaos-space-events-page.component'),
    data: { pageAnimationLayer: 2 },
  },
  {
    path: 'resolve-chaos-space-events/:chaosSpaceEventId',
    loadComponent: () => import('./chaos-space-event-page.component'),
    data: { pageAnimationLayer: 3 },
  },
  {
    path: 'chaos-space-event-templates',
    loadComponent: () =>
      import('./manage-chaos-space-event-templates-page.component'),
    data: { pageAnimationLayer: 2 },
  },
  {
    path: 'chaos-space-event-templates/new',
    loadComponent: () =>
      import('./new-chaos-space-event-template-page.component'),
    data: { pageAnimationLayer: 3 },
  },
  {
    path: 'chaos-space-event-templates/:chaosSpaceEventTemplateId',
    loadComponent: () =>
      import('./edit-chaos-space-event-template-page.component'),
    data: { pageAnimationLayer: 3 },
    resolve: {
      originalChaosSpaceEventTemplate: editChaosSpaceEventTemplateResolver,
    },
  },
  {
    path: 'enter-event-scores',
    loadComponent: () => import('./enter-event-scores-page.component'),
    data: { pageAnimationLayer: 1 },
  },

  // betting
  {
    path: 'resolve-bets',
    loadComponent: () => import('./resolve-bets-page.component'),
    data: { pageAnimationLayer: 1 },
  },
  {
    path: 'bet-bulk-cancel',
    loadComponent: () => import('./bet-bulk-cancel-page.component'),
    data: { pageAnimationLayer: 1 },
  },

  // players
  {
    path: 'override-points',
    loadComponent: () =>
      import('./override-points-choose-player-page.component'),
    data: { pageAnimationLayer: 1 },
  },
  {
    path: 'override-points/:playerId',
    loadComponent: () => import('./override-points-page.component'),
    data: { pageAnimationLayer: 2 },
  },
  {
    path: 'edit-profiles',
    loadComponent: () => import('./edit-player-profiles-page.component'),
    data: { pageAnimationLayer: 1 },
  },
  {
    path: 'edit-permissions',
    loadComponent: () => import('./edit-player-permissions-page.component'),
    data: { pageAnimationLayer: 1 },
  },
  {
    path: 'change-gm',
    loadComponent: () => import('./change-gm-page.component'),
    data: { pageAnimationLayer: 1 },
  },

  // session
  {
    path: 'create-session',
    loadComponent: () => import('./create-session-page.component'),
    data: { pageAnimationLayer: 1 },
  },
  {
    path: 'start-session-early',
    loadComponent: () => import('./start-session-early-page.component'),
    data: { pageAnimationLayer: 1 },
  },
  {
    path: 'end-session',
    loadComponent: () => import('./end-session-page.component'),
    data: { pageAnimationLayer: 1 },
  },
  {
    path: 'space-types',
    loadComponent: () =>
      import('./manage-gameboard-space-types-page.component'),
    data: { pageAnimationLayer: 1 },
  },
  {
    path: 'space-types/new',
    loadComponent: () => import('./new-gameboard-space-type-page.component'),
    data: { pageAnimationLayer: 2 },
  },
  {
    path: 'space-types/:gameboardSpaceId',
    loadComponent: () => import('./edit-gameboard-space-type-page.component'),
    data: { pageAnimationLayer: 2 },
    resolve: { originalGameboardSpace: editGameboardSpaceTypeResolver },
  },
  {
    path: 'events',
    loadComponent: () => import('./manage-events-page.component'),
    data: { pageAnimationLayer: 1 },
  },
  {
    path: 'events/new',
    loadComponent: () => import('./new-event-page.component'),
    data: { pageAnimationLayer: 2 },
  },
  {
    path: 'events/edit/:eventId',
    loadComponent: () => import('./edit-event-page.component'),
    data: { pageAnimationLayer: 2 },
    resolve: { originalEvent: editEventResolver },
  },
  {
    path: 'events/teams/:eventId',
    loadComponent: () => import('./edit-event-teams-page.component'),
    data: { pageAnimationLayer: 2 },
    resolve: { originalEvent: editEventResolver },
  },
  {
    path: 'bracket',
    loadComponent: () => import('./create-bracket-page.component'),
    data: { pageAnimationLayer: 1 },
  },
  {
    path: 'override-bank-balance',
    loadComponent: () => import('./override-bank-balance-page.component'),
    data: { pageAnimationLayer: 1 },
  },
];

export default gmToolsRoutes;
