import { Routes } from '@angular/router';

const bettingRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./betting-dashboard-page.component'),
    data: { pageAnimationLayer: 0 },
  },

  {
    path: 'place-bet',
    loadComponent: () => import('./place-bet-page.component'),
    data: { pageAnimationLayer: 1 },
  },

  {
    path: 'accept-bets',
    loadComponent: () => import('./accept-bets-page.component'),
    data: { pageAnimationLayer: 1 },
  },

  {
    path: 'review-user-bets',
    loadComponent: () => import('./review-user-bets-page.component'),
    data: { pageAnimationLayer: 1 },
  },

  {
    path: 'resolved-bets',
    loadComponent: () => import('./resolved-bets-page.component'),
    data: { pageAnimationLayer: 1 },
  },
];
export default bettingRoutes;
