import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FrameworkStateService } from '../../services/framework-state.service';
import { ModeOption, ProjectMode } from '../../models/framework.types';

@Component({
  selector: 'app-mode-selector',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  templateUrl: './mode-selector.component.html',
  styles: [`
    .page-container { padding: 24px; }
    .page-header {
      display: flex; align-items: center; gap: 12px; margin-bottom: 32px;
      h1 { margin: 0; font-size: 1.75rem; font-weight: 600; line-height: 1.2; }
    }
    .header-icon { font-size: 2.5rem; width: 2.5rem; height: 2.5rem; color: #3f51b5; }
    .subtitle { font-size: 0.85rem; color: rgba(0,0,0,0.5); }

    .modes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      max-width: 960px;
    }
    .mode-card {
      padding: 28px;
      cursor: pointer;
      border: 2px solid transparent;
      border-radius: 12px;
      transition: all 0.15s ease;
      position: relative;

      &:hover {
        border-color: #3f51b5;
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.1);
      }

      h3 { margin: 12px 0 8px; font-size: 1.1rem; font-weight: 600; }
      p { margin: 0; font-size: 0.85rem; color: rgba(0,0,0,0.55); line-height: 1.5; }
    }
    .mode-icon {
      font-size: 2rem; width: 2rem; height: 2rem; color: #3f51b5;
    }
    .arrow {
      position: absolute; top: 28px; right: 20px;
      color: rgba(0,0,0,0.2); transition: color 0.15s;
    }
    .mode-card:hover .arrow { color: #3f51b5; }
  `],
})
export class ModeSelectorComponent {
  private readonly state = inject(FrameworkStateService);
  private readonly router = inject(Router);

  readonly modes: ModeOption[] = [
    {
      mode: 'new',
      title: 'Proyecto Nuevo',
      description: 'Crea un proyecto desde cero con scaffold, convenciones y CI/CD configurado por Claude Code.',
      icon: 'add_circle_outline',
    },
    {
      mode: 'existing',
      title: 'Proyecto Existente',
      description: 'Agrega features, corrige bugs o refactoriza un proyecto que ya existe con la ayuda de Claude Code.',
      icon: 'edit_note',
    },
    {
      mode: 'migration',
      title: 'Migracion',
      description: 'Migra versiones, frameworks o librerias con contract tests y validacion paso a paso.',
      icon: 'swap_horiz',
    },
  ];

  select(mode: ProjectMode): void {
    this.state.selectMode(mode);
    this.router.navigate(['/claude-framework/tech']);
  }
}
