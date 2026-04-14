import { Routes } from '@angular/router';

export const ACCOUNT_PLANNING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/client-list/client-list.component').then(m => m.ClientListComponent),
  },
  {
    path: 'clients/new',
    loadComponent: () =>
      import('./pages/client-form/client-form.component').then(m => m.ClientFormComponent),
  },
  {
    path: 'clients/:id/edit',
    loadComponent: () =>
      import('./pages/client-form/client-form.component').then(m => m.ClientFormComponent),
  },
  {
    path: 'sessions/:id',
    loadComponent: () =>
      import('./pages/planning-session/planning-session.component').then(m => m.PlanningSessionComponent),
  },
];
