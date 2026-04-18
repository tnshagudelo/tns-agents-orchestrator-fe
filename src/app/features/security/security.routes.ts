import { Routes } from '@angular/router';

export const SECURITY_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'groups',
    pathMatch: 'full',
  },
  {
    path: 'groups',
    loadComponent: () =>
      import('./pages/groups-page/groups-page.component').then(m => m.GroupsPageComponent),
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./pages/users-page/users-page.component').then(m => m.UsersPageComponent),
  },
];
