import { Component, inject, computed } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FrameworkStateService } from '../../services/framework-state.service';
import { ClipboardService } from '../../services/clipboard.service';
import { getSteps } from '../../data/steps.data';
import { StepTag } from '../../models/framework.types';

@Component({
  selector: 'app-steps-tab',
  standalone: true,
  imports: [MatCheckboxModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './steps-tab.component.html',
  styles: [`
    .progress-section { margin-bottom: 20px; }
    .progress-header {
      display: flex; justify-content: space-between; margin-bottom: 6px;
    }
    .progress-label { font-size: 0.8rem; color: rgba(0,0,0,0.5); }
    .progress-value { font-size: 0.8rem; font-weight: 600; color: #3f51b5; }
    .progress-track {
      height: 6px; background: #e8eaf6; border-radius: 3px; overflow: hidden;
    }
    .progress-fill {
      height: 100%; background: #3f51b5; border-radius: 3px;
      transition: width 0.3s ease;
    }

    .success-banner {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 16px; border-radius: 8px;
      background: #dcfce7; color: #166534;
      margin-bottom: 20px;
      mat-icon { color: #16a34a; }
      span { flex: 1; font-size: 0.85rem; font-weight: 500; }
    }

    .steps-list { display: flex; flex-direction: column; gap: 12px; }
    .step-item {
      display: flex; gap: 12px; align-items: flex-start;
      padding: 14px 16px; border-radius: 8px;
      border: 1px solid rgba(0,0,0,0.08);
      transition: background 0.15s, border-color 0.15s;
      &:hover { border-color: rgba(0,0,0,0.15); }
      &.step-done {
        background: #f8faf8;
        border-color: #dcfce7;
        .step-title { text-decoration: line-through; color: rgba(0,0,0,0.4); }
      }
    }

    .step-content { flex: 1; min-width: 0; }
    .step-header { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .step-number {
      width: 22px; height: 22px; border-radius: 50%;
      background: #e8eaf6; color: #3f51b5;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.7rem; font-weight: 700; flex-shrink: 0;
    }
    .step-title { font-weight: 600; font-size: 0.9rem; }
    .step-tag {
      font-size: 0.65rem; padding: 1px 8px; border-radius: 10px; font-weight: 500;
      &.tag--context { background: #e8eaf6; color: #3f51b5; }
      &.tag--spec { background: #fef3c7; color: #92400e; }
      &.tag--validate { background: #dcfce7; color: #166534; }
    }
    .step-desc {
      margin: 6px 0 0; font-size: 0.82rem; color: rgba(0,0,0,0.55); line-height: 1.5;
    }
    .step-tip {
      display: flex; align-items: flex-start; gap: 6px; margin-top: 8px;
      padding: 8px 12px; border-radius: 6px;
      background: #fffbeb; border: 1px solid #fef3c7;
      font-size: 0.78rem; color: #92400e; line-height: 1.5;
      mat-icon { font-size: 16px; width: 16px; height: 16px; flex-shrink: 0; margin-top: 1px; color: #d97706; }
    }
    .step-command {
      display: flex; align-items: center; gap: 8px; margin-top: 8px;
      background: #1a1a2e; border-radius: 6px; padding: 6px 12px;
      code {
        flex: 1; font-family: 'Roboto Mono', monospace; font-size: 0.78rem;
        color: #a5d6ff; word-break: break-all;
      }
      button { color: rgba(255,255,255,0.6); }
    }
  `],
})
export class StepsTabComponent {
  protected readonly state = inject(FrameworkStateService);
  protected readonly clipboard = inject(ClipboardService);

  readonly steps = computed(() => {
    const mode = this.state.mode();
    const tech = this.state.techId();
    return mode && tech ? getSteps(mode, tech) : [];
  });

  isChecked(stepId: string): boolean {
    return !!this.state.checkedSteps()[stepId];
  }

  copy(text: string, id: string): void {
    this.clipboard.copy(text, id);
  }

  tagLabel(tag: StepTag): string {
    const labels: Record<StepTag, string> = {
      context: 'Contexto',
      spec: 'Spec',
      validate: 'Validar',
    };
    return labels[tag];
  }
}
