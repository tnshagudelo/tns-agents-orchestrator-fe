import { Component, input, computed, signal, effect } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BackgroundJobStatus_Response } from '../../../../models/account-planning.model';

interface ActivityEntry {
  message: string;
  time: Date;
  done: boolean;
}

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

  /** Activity log — accumulates as steps change */
  readonly activityLog = signal<ActivityEntry[]>([]);
  private lastStep = '';

  constructor() {
    effect(() => {
      const step = this.job().currentStep ?? '';
      if (step && step !== this.lastStep) {
        // Mark previous as done
        this.activityLog.update(log => {
          const updated = log.map(e => ({ ...e, done: true }));
          updated.push({ message: step, time: new Date(), done: false });
          return updated;
        });
        this.lastStep = step;
      }
    });
  }

  readonly estimatedTime = computed(() => {
    const progress = this.job().progress;
    if (progress >= 90) return 'Casi listo...';
    if (progress >= 80) return 'Menos de 1 minuto';
    if (progress >= 55) return '~1-2 minutos';
    if (progress >= 30) return '~2-3 minutos';
    return '~3-5 minutos';
  });
}
