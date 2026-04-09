import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { FrameworkStateService } from '../../services/framework-state.service';
import { TechId } from '../../models/framework.types';
import { TECHNOLOGIES } from '../../data/technologies.data';

@Component({
  selector: 'app-tech-selector',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatChipsModule],
  templateUrl: './tech-selector.component.html',
  styles: [`
    .page-container { padding: 24px; }

    .breadcrumb {
      display: flex; align-items: center; gap: 4px; margin-bottom: 24px;
      .separator { font-size: 18px; color: rgba(0,0,0,0.3); }
    }
    .mode-chip {
      --mdc-chip-label-text-color: #3f51b5;
      --mdc-chip-elevated-container-color: #e8eaf6;
      font-weight: 500;
    }

    .page-header {
      margin-bottom: 28px;
      h1 { margin: 0; font-size: 1.75rem; font-weight: 600; }
    }
    .subtitle { font-size: 0.85rem; color: rgba(0,0,0,0.5); }

    .tech-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      max-width: 960px;
    }
    @media (max-width: 768px) {
      .tech-grid { grid-template-columns: repeat(2, 1fr); }
    }

    .tech-card {
      padding: 20px;
      cursor: pointer;
      border: 2px solid transparent;
      border-radius: 12px;
      transition: all 0.15s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 8px;

      &:hover {
        border-color: #3f51b5;
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.1);
      }

      h3 { margin: 0; font-size: 1rem; font-weight: 600; }
    }

    .tech-badge {
      width: 48px; height: 48px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700;
      font-size: 1.1rem;
      letter-spacing: 0.5px;
    }

    .tech-stack {
      font-size: 0.72rem;
      color: rgba(0,0,0,0.45);
      line-height: 1.4;
    }
  `],
})
export class TechSelectorComponent {
  private readonly state = inject(FrameworkStateService);
  private readonly router = inject(Router);

  readonly technologies = TECHNOLOGIES;

  readonly modeLabel = computed(() => {
    const labels: Record<string, string> = { new: 'Proyecto Nuevo', existing: 'Proyecto Existente', migration: 'Migracion', 'multi-repo': 'Multi-Repositorio' };
    const m = this.state.mode();
    return m ? labels[m] : '';
  });

  select(techId: TechId): void {
    this.state.selectTech(techId);
    this.router.navigate(['/claude-framework/guide']);
  }

  goBack(): void {
    this.state.goBack();
    this.router.navigate(['/claude-framework']);
  }
}
