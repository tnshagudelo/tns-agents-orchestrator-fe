import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'agents',
        loadChildren: () =>
          import('./features/agents/agents.routes').then(m => m.AGENTS_ROUTES),
      },
      {
        path: 'orchestration',
        loadChildren: () =>
          import('./features/orchestration/orchestration.routes').then(m => m.ORCHESTRATION_ROUTES),
      },
      {
        path: 'monitoring',
        loadChildren: () =>
          import('./features/monitoring/monitoring.routes').then(m => m.MONITORING_ROUTES),
      },
      {
        path: 'projectmanageragent',
        loadChildren: () =>
          import('./features/projectmanageragent/projectmanageragent.routes').then(m => m.PROJECTMANAGERAGENT_ROUTES),
      },
      {
        path: 'proposals',
        loadChildren: () =>
          import('./features/proposals/proposals.routes').then(m => m.PROPOSALS_ROUTES),
      },
      {
        path: 'sessions',
        loadChildren: () =>
          import('./features/sessions/sessions.routes').then(m => m.SESSIONS_ROUTES),
      },
      {
        path: 'knowledge',
        loadChildren: () =>
          import('./features/knowledge/knowledge.routes').then(m => m.KNOWLEDGE_ROUTES),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./features/settings/settings.routes').then(m => m.SETTINGS_ROUTES),
      },
    ],
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
