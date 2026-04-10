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

/** Must match the currentStep strings sent by DeepResearchWorker */
const PHASE_ORDER = ['WEB_SEARCH', 'RAG_SEARCH', 'ANALYSIS', 'COMPLETING'];

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
      { id: 'WEB_SEARCH', label: 'Investigación', icon: 'travel_explore' },
      { id: 'RAG_SEARCH', label: 'Base de conocimiento', icon: 'psychology' },
      { id: 'ANALYSIS', label: 'Análisis estratégico', icon: 'analytics' },
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
      case 'PREPARING': return 'Preparando investigación...';
      case 'WEB_SEARCH': return 'Investigando la empresa en fuentes públicas...';
      case 'RAG_SEARCH': return 'Consultando base de conocimiento interna...';
      case 'ANALYSIS': return 'Analizando hallazgos y generando insights estratégicos...';
      case 'COMPLETING': return 'Finalizando...';
      default: return 'Procesando...';
    }
  });

  readonly estimatedTime = computed(() => {
    const progress = this.job().progress;
    if (progress >= 90) return 'Casi listo...';
    if (progress >= 65) return 'Menos de 1 minuto';
    if (progress >= 40) return '~1-2 minutos restantes';
    return '~2-3 minutos restantes';
  });
}
