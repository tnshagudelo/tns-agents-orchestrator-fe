import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/landing/landing.component').then(m => m.LandingComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./features/home/home.component').then(m => m.HomeComponent),
      },
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
        path: 'dev-methodology',
        loadChildren: () =>
          import('./features/dev-methodology/dev-methodology.routes').then(m => m.DEV_METHODOLOGY_ROUTES),
      },
      {
        path: 'how-we-work',
        loadChildren: () =>
          import('./features/how-we-work/how-we-work.routes').then(m => m.HOW_WE_WORK_ROUTES),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./features/settings/settings.routes').then(m => m.SETTINGS_ROUTES),
      },
      {
        path: 'security',
        loadChildren: () =>
          import('./features/security/security.routes').then(m => m.SECURITY_ROUTES),
      },
    ],
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: 'public',
    loadComponent: () =>
      import('./layout/public-layout/public-layout.component').then(m => m.PublicLayoutComponent),
    children: [
      {
        path: 'how-we-work',
        loadChildren: () =>
          import('./features/how-we-work/how-we-work.routes').then(m => m.HOW_WE_WORK_ROUTES),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
