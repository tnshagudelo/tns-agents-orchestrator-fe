import { Routes } from '@angular/router';

export const DEV_METHODOLOGY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/mode-selector/mode-selector.component').then(m => m.ModeSelectorComponent),
  },
  {
    path: 'tech',
    loadComponent: () =>
      import('./components/tech-selector/tech-selector.component').then(m => m.TechSelectorComponent),
  },
  {
    path: 'guide',
    loadComponent: () =>
      import('./components/guide-panel/guide-panel.component').then(m => m.GuidePanelComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
