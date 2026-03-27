import { Component, computed, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { ProposalIteration } from '../../models/proposal.model';

@Component({
  selector: 'app-proposal-diff',
  standalone: true,
  imports: [MatChipsModule, MatIconModule],
  templateUrl: './proposal-diff.component.html',
  styles: [`
    .diff-container { padding: 4px 0; }

    .no-diff {
      display: flex; align-items: center; gap: 8px; padding: 16px;
      color: rgba(0,0,0,0.45); font-size: 0.85rem;
      mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }
    }

    .diff-section { margin-bottom: 16px; }
    .diff-section h4 { margin: 0 0 8px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; color: rgba(0,0,0,0.5); }

    .components-diff { display: flex; flex-wrap: wrap; gap: 6px; }

    mat-chip { font-size: 0.75rem; height: 24px;
      mat-icon { font-size: 0.8rem; width: 0.8rem; height: 0.8rem; margin-right: 2px; }
    }
    .chip-added    { --mdc-chip-label-text-color: #3B6D11; background: #dcfce7 !important; }
    .chip-removed  { --mdc-chip-label-text-color: #A32D2D; background: #fee2e2 !important; text-decoration: line-through; }
    .chip-unchanged{ --mdc-chip-label-text-color: #555; background: #f3f4f6 !important; }

    .metrics-diff { display: flex; flex-direction: column; gap: 6px; }
    .metric-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; }
    .metric-label { color: rgba(0,0,0,0.6); }
    .metric-values { display: flex; align-items: center; gap: 6px; }
    .old-value { color: #A32D2D; text-decoration: line-through; }
    .new-value { color: #3B6D11; font-weight: 600; }
    .same-value { color: rgba(0,0,0,0.7); }
    .arrow { font-size: 0.9rem; width: 0.9rem; height: 0.9rem; color: rgba(0,0,0,0.4); }
  `],
})
export class ProposalDiffComponent {
  current = input.required<ProposalIteration>();
  previous = input<ProposalIteration | null>(null);

  addedComponents = computed(() => {
    const prev = this.previous();
    if (!prev) return [];
    return this.current().components.filter(c => !prev.components.includes(c));
  });

  removedComponents = computed(() => {
    const prev = this.previous();
    if (!prev) return [];
    return prev.components.filter(c => !this.current().components.includes(c));
  });

  unchangedComponents = computed(() => {
    const prev = this.previous();
    if (!prev) return this.current().components;
    return this.current().components.filter(c => prev.components.includes(c));
  });

  metricChanges = computed(() => {
    const cur = this.current();
    const prev = this.previous();
    if (!prev) return [];

    return [
      { label: 'Equipo', oldFormatted: `${prev.teamSize} personas`, newFormatted: `${cur.teamSize} personas`, changed: prev.teamSize !== cur.teamSize },
      { label: 'Duración', oldFormatted: `${prev.durationWeeks} sem`, newFormatted: `${cur.durationWeeks} sem`, changed: prev.durationWeeks !== cur.durationWeeks },
      { label: 'Riesgo', oldFormatted: prev.riskLevel, newFormatted: cur.riskLevel, changed: prev.riskLevel !== cur.riskLevel },
    ];
  });
}
