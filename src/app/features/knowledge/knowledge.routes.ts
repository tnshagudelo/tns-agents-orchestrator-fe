import { Routes } from '@angular/router';

export const KNOWLEDGE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/knowledge-manager/knowledge-manager.component').then(
        m => m.KnowledgeManagerComponent,
      ),
  },
];
