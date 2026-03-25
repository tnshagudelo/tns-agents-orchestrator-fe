import { Component, computed, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { ProposalIteration } from '../../models/proposal.model';

@Component({
  selector: 'app-proposal-diff',
  standalone: true,
  imports: [MatChipsModule, MatIconModule],
  template: `
    <div class="diff-container">
      @if (!previous()) {
        <div class="no-diff">
          <mat-icon>info</mat-icon>
          <span>Esta es la versión inicial — no hay versión anterior para comparar.</span>
        </div>
      } @else {
        <div class="diff-section">
          <h4>Componentes</h4>
          <div class="components-diff">
            @for (c of addedComponents(); track c) {
              <mat-chip class="chip-added" disableRipple>
                <mat-icon>add</mat-icon>{{ c }}
              </mat-chip>
            }
            @for (c of removedComponents(); track c) {
              <mat-chip class="chip-removed" disableRipple>
                <mat-icon>remove</mat-icon>{{ c }}
              </mat-chip>
            }
            @for (c of unchangedComponents(); track c) {
              <mat-chip class="chip-unchanged" disableRipple>{{ c }}</mat-chip>
            }
          </div>
        </div>

        <div class="diff-section">
          <h4>Métricas</h4>
          <div class="metrics-diff">
            @for (m of metricChanges(); track m.label) {
              <div class="metric-row">
                <span class="metric-label">{{ m.label }}</span>
                <div class="metric-values">
                  @if (m.changed) {
                    <span class="old-value">{{ m.oldFormatted }}</span>
                    <mat-icon class="arrow">arrow_forward</mat-icon>
                    <span class="new-value">{{ m.newFormatted }}</span>
                  } @else {
                    <span class="same-value">{{ m.newFormatted }}</span>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
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
