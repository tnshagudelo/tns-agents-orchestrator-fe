import { Routes } from '@angular/router';

export const HOW_WE_WORK_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/how-we-work-page/how-we-work-page.component').then(
        m => m.HowWeWorkPageComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
