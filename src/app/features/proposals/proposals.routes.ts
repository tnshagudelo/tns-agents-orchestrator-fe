import { Routes } from '@angular/router';

export const PROPOSALS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/proposals-dashboard/proposals-dashboard.component').then(
        m => m.ProposalsDashboardComponent
      ),
  },
  {
    path: ':id/workpad',
    loadComponent: () =>
      import('./pages/proposal-workpad/proposal-workpad.component').then(
        m => m.ProposalWorkpadComponent
      ),
  },
  {
    path: ':id/review',
    loadComponent: () =>
      import('./pages/proposal-review/proposal-review.component').then(
        m => m.ProposalReviewComponent
      ),
  },
];
