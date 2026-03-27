import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { FrameworkStateService } from '../../services/framework-state.service';
import { getTechnology } from '../../data/technologies.data';
import { TabId } from '../../models/framework.types';
import { StepsTabComponent } from '../steps-tab/steps-tab.component';
import { PromptsTabComponent } from '../prompts-tab/prompts-tab.component';
import { ClaudeMdTabComponent } from '../claude-md-tab/claude-md-tab.component';
import { SpecsTabComponent } from '../specs-tab/specs-tab.component';
import { ConventionsTabComponent } from '../conventions-tab/conventions-tab.component';

const TAB_MAP: TabId[] = ['steps', 'prompts', 'claudemd', 'specs', 'conventions'];

@Component({
  selector: 'app-guide-panel',
  standalone: true,
  imports: [
    MatIconModule, MatButtonModule, MatChipsModule, MatTabsModule,
    StepsTabComponent, PromptsTabComponent, ClaudeMdTabComponent,
    SpecsTabComponent, ConventionsTabComponent,
  ],
  templateUrl: './guide-panel.component.html',
  styles: [`
    .page-container { padding: 24px; }

    .breadcrumb {
      display: flex; align-items: center; gap: 4px; margin-bottom: 20px;
      .separator { font-size: 18px; color: rgba(0,0,0,0.3); }
    }
    .tech-pill {
      padding: 3px 12px; border-radius: 14px;
      font-size: 0.78rem; font-weight: 600; letter-spacing: 0.3px;
    }

    .guide-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 24px; flex-wrap: wrap; gap: 12px;
    }
    .guide-title-row { display: flex; align-items: center; gap: 14px; }
    .tech-badge-lg {
      width: 52px; height: 52px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 1.2rem; flex-shrink: 0;
    }
    h1 { margin: 0; font-size: 1.5rem; font-weight: 600; line-height: 1.2; }
    .tech-stack { font-size: 0.82rem; color: rgba(0,0,0,0.5); }

    .mode-chip {
      --mdc-chip-label-text-color: #3f51b5;
      --mdc-chip-elevated-container-color: #e8eaf6;
      font-weight: 500;
    }

    .tab-content { padding: 20px 0; }
  `],
})
export class GuidePanelComponent {
  private readonly state = inject(FrameworkStateService);
  private readonly router = inject(Router);

  readonly tech = computed(() => {
    const id = this.state.techId();
    return id ? getTechnology(id) : undefined;
  });

  readonly modeLabel = computed(() => {
    const labels = { new: 'Proyecto Nuevo', existing: 'Proyecto Existente', migration: 'Migracion' };
    const m = this.state.mode();
    return m ? labels[m] : '';
  });

  readonly tabIndex = computed(() => {
    const tab = this.state.activeTab();
    return TAB_MAP.indexOf(tab);
  });

  onTabChange(index: number): void {
    this.state.activeTab.set(TAB_MAP[index]);
  }

  goToModes(): void {
    this.state.mode.set(null);
    this.state.techId.set(null);
    this.router.navigate(['/claude-framework']);
  }

  goToTech(): void {
    this.state.techId.set(null);
    this.router.navigate(['/claude-framework/tech']);
  }
}
