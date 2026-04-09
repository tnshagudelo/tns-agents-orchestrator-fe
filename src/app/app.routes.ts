import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'account-planning',
    pathMatch: 'full',
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'account-planning',
        loadChildren: () =>
          import('./features/account-planning/account-planning.routes').then(m => m.ACCOUNT_PLANNING_ROUTES),
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
        path: 'knowledge',
        loadChildren: () =>
          import('./features/knowledge/knowledge.routes').then(m => m.KNOWLEDGE_ROUTES),
      },
      {
        path: 'claude-framework',
        loadChildren: () =>
          import('./features/claude-framework/claude-framework.routes').then(m => m.CLAUDE_FRAMEWORK_ROUTES),
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
