import { Routes } from '@angular/router';

export const AGENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/agent-list/agent-list.component').then(m => m.AgentListComponent),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/agent-create/agent-create.component').then(m => m.AgentCreateComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/agent-detail/agent-detail.component').then(m => m.AgentDetailComponent),
  },
];
