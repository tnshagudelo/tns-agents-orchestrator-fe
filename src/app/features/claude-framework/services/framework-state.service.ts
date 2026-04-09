import { Injectable, signal, computed } from '@angular/core';
import { ProjectMode, TabId, TechId } from '../models/framework.types';
import { getSteps } from '../data/steps.data';

@Injectable({ providedIn: 'root' })
export class FrameworkStateService {
  readonly mode = signal<ProjectMode | null>(null);
  readonly techId = signal<TechId | null>(null);
  readonly activeTab = signal<TabId>('steps');
  readonly checkedSteps = signal<Record<string, boolean>>({});

  readonly progress = computed(() => {
    const m = this.mode();
    const t = this.techId();
    if (!m || !t) return 0;

    const steps = getSteps(m, t);
    if (steps.length === 0) return 0;

    const checked = this.checkedSteps();
    const completed = steps.filter(s => checked[s.id]).length;
    return Math.round((completed / steps.length) * 100);
  });

  selectMode(mode: ProjectMode): void {
    this.mode.set(mode);
    this.checkedSteps.set({});
    this.activeTab.set('steps');
  }

  selectTech(techId: TechId): void {
    this.techId.set(techId);
    this.checkedSteps.set({});
    this.activeTab.set('steps');
  }

  toggleStep(stepId: string): void {
    this.checkedSteps.update(prev => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  }

  resetProgress(): void {
    this.checkedSteps.set({});
  }

  goBack(): void {
    if (this.techId()) {
      this.techId.set(null);
      this.checkedSteps.set({});
    } else if (this.mode()) {
      this.mode.set(null);
    }
  }
}
