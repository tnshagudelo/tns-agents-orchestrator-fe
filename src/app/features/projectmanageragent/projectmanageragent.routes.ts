import { Routes } from '@angular/router';

export const PROJECTMANAGERAGENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/projectmanager-agent.component').then(
        m => m.ProjectManagerAgentComponent
      ),
  },
];
