import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'callback',
    loadComponent: () =>
      import('./pages/callback/callback.component').then(m => m.AuthCallbackComponent),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
