import { Routes } from '@angular/router';

export const SESSIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/sessions-dashboard/sessions-dashboard.component').then(
        m => m.SessionsDashboardComponent
      ),
  },
];
