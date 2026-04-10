import { Component, input, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BackgroundJobStatus_Response } from '../../../../models/account-planning.model';

interface SearchPhase {
  id: string;
  label: string;
  icon: string;
  status: 'pending' | 'active' | 'completed';
}

const PHASE_ORDER = ['WEB_SEARCH', 'LINKEDIN', 'RAG_SEARCH', 'ANALYSIS'];

@Component({
  selector: 'app-search-progress',
  standalone: true,
  imports: [MatIconModule, MatProgressBarModule],
  templateUrl: './search-progress.component.html',
  styleUrl: './search-progress.component.scss',
})
export class SearchProgressComponent {
  readonly job = input.required<BackgroundJobStatus_Response>();
  readonly clientName = input<string>('');

  readonly phases = computed<SearchPhase[]>(() => {
    const currentStep = this.job().currentStep ?? '';
    const currentIndex = PHASE_ORDER.indexOf(currentStep);

    return [
      { id: 'WEB_SEARCH', label: 'Búsqueda web', icon: 'travel_explore' },
      { id: 'LINKEDIN', label: 'LinkedIn', icon: 'work' },
      { id: 'RAG_SEARCH', label: 'Base de conocimiento', icon: 'psychology' },
      { id: 'ANALYSIS', label: 'Análisis', icon: 'analytics' },
    ].map((phase, i) => ({
      ...phase,
      status: i < currentIndex ? 'completed' as const
        : i === currentIndex ? 'active' as const
        : 'pending' as const,
    }));
  });

  readonly progressLabel = computed(() => {
    const step = this.job().currentStep;
    switch (step) {
      case 'WEB_SEARCH': return 'Buscando en portales web confiables...';
      case 'LINKEDIN': return 'Consultando perfil de LinkedIn...';
      case 'RAG_SEARCH': return 'Buscando en base de conocimiento interna...';
      case 'ANALYSIS': return 'Analizando hallazgos y generando insights...';
      default: return 'Procesando...';
    }
  });

  readonly estimatedTime = computed(() => {
    const progress = this.job().progress;
    if (progress >= 90) return 'Finalizando...';
    if (progress >= 70) return 'Menos de 1 minuto';
    if (progress >= 40) return '~2 minutos restantes';
    return '~3-4 minutos restantes';
  });
}
