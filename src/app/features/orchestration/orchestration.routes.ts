import { Routes } from '@angular/router';

export const ORCHESTRATION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/orchestration-board/orchestration-board.component').then(
        m => m.OrchestrationBoardComponent
      ),
  },
];
