import { Component, inject, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FrameworkStateService } from '../../services/framework-state.service';
import { ClipboardService } from '../../services/clipboard.service';
import { getSkills } from '../../data/skills.data';

@Component({
  selector: 'app-skills-tab',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './skills-tab.component.html',
  styles: [`
    .info-banner {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 16px; border-radius: 8px;
      background: #f3e8ff; color: #6d28d9;
      margin-bottom: 20px;
      mat-icon { flex-shrink: 0; }
      span { font-size: 0.82rem; line-height: 1.5; }
    }

    .skills-list { display: flex; flex-direction: column; gap: 10px; }

    .skill-card {
      padding: 14px 16px; border-radius: 10px;
      border: 1px solid #e5e7eb; background: #fafafa;
      cursor: pointer; transition: all 0.15s;
      &:hover { border-color: #c4b5fd; background: #fefefe; }
    }
    .skill-card--expanded {
      border-color: #a78bfa;
      box-shadow: 0 2px 10px rgba(124,58,237,0.08);
    }

    .skill-header {
      display: flex; align-items: center; gap: 10px;
    }
    .skill-command-badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 10px; border-radius: 6px;
      background: #1a1a2e; color: #a78bfa;
      font-family: 'Cascadia Code', 'Fira Code', monospace;
      font-size: 0.76rem; font-weight: 600;
      mat-icon { font-size: 13px; width: 13px; height: 13px; color: #818cf8; }
    }
    .skill-name {
      font-size: 0.85rem; font-weight: 600; color: #1a1a2e;
    }
    .skill-expand {
      margin-left: auto;
      color: rgba(0,0,0,0.3); font-size: 18px; width: 18px; height: 18px;
    }

    .skill-desc {
      margin: 8px 0 0; font-size: 0.78rem;
      color: rgba(0,0,0,0.55); line-height: 1.5;
    }

    .skill-details {
      margin-top: 12px; display: flex; flex-direction: column; gap: 10px;
      animation: fadeIn 0.2s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .skill-when {
      display: flex; align-items: flex-start; gap: 6px;
      padding: 8px 12px; border-radius: 6px;
      background: #f0f9ff; border: 1px solid #bae6fd;
      font-size: 0.76rem; color: #0369a1; line-height: 1.5;
      mat-icon { font-size: 14px; width: 14px; height: 14px; flex-shrink: 0; margin-top: 1px; color: #0284c7; }
    }

    .skill-example {
      border-radius: 8px; overflow: hidden;
      border: 1px solid #e5e7eb;
    }
    .skill-example-header {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 12px; background: #f5f5f5;
      border-bottom: 1px solid #e5e7eb;
      font-size: 0.72rem; font-weight: 600; color: rgba(0,0,0,0.5);
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }
    .skill-copy {
      margin-left: auto;
      width: 28px !important; height: 28px !important;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }
    .skill-example-code {
      display: block; padding: 12px 14px;
      background: #1a1a2e; color: #c4b5fd;
      font-family: 'Cascadia Code', 'Fira Code', monospace;
      font-size: 0.78rem; line-height: 1.6;
      white-space: pre-wrap; word-break: break-word;
    }

    /* ── Setup section ──────────────────────────────── */
    .setup-section {
      margin-top: 24px;
    }
    .setup-title {
      display: flex; align-items: center; gap: 8px;
      font-size: 0.95rem; font-weight: 600; margin: 0 0 14px; color: #1a1a2e;
      mat-icon { color: #3f51b5; }
    }

    .setup-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 12px;
    }
    .setup-card {
      padding: 16px; border-radius: 10px;
      border: 1px solid #e5e7eb; background: white;
      p { margin: 0 0 10px; font-size: 0.78rem; color: rgba(0,0,0,0.55); line-height: 1.5; }
    }
    .setup-card-header {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.82rem; font-weight: 600; margin-bottom: 10px;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
    .setup-card-header--builtin { color: #059669; }
    .setup-card-header--project { color: #3f51b5; }
    .setup-card-header--personal { color: #7c3aed; }

    .setup-commands {
      display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px;
      code {
        padding: 3px 10px; border-radius: 6px;
        background: #1a1a2e; color: #a78bfa;
        font-family: 'Cascadia Code', 'Fira Code', monospace;
        font-size: 0.72rem; font-weight: 600;
      }
    }
    .setup-path {
      margin-bottom: 8px;
      code {
        display: inline-block; padding: 4px 10px; border-radius: 6px;
        background: #f1f5f9; color: #334155;
        font-family: 'Cascadia Code', 'Fira Code', monospace;
        font-size: 0.74rem; font-weight: 500;
        border: 1px solid #e2e8f0;
      }
    }
    .setup-invocation {
      display: flex; align-items: center; gap: 4px;
      font-size: 0.74rem; color: rgba(0,0,0,0.5); margin-bottom: 8px;
      mat-icon { font-size: 12px; width: 12px; height: 12px; }
      code {
        padding: 1px 6px; border-radius: 4px;
        background: #1a1a2e; color: #a78bfa;
        font-family: 'Cascadia Code', 'Fira Code', monospace;
        font-size: 0.72rem;
      }
    }
    .setup-note {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.7rem; color: rgba(0,0,0,0.4);
      mat-icon { font-size: 13px; width: 13px; height: 13px; color: rgba(0,0,0,0.3); }
    }

    /* ── Steps to create ─────────────────────────────── */
    .setup-steps {
      display: flex; flex-direction: column; gap: 16px;
    }
    .setup-step {
      display: flex; gap: 12px;
      strong { font-size: 0.85rem; color: #1a1a2e; display: block; margin-bottom: 4px; }
      p { margin: 0 0 8px; font-size: 0.78rem; color: rgba(0,0,0,0.55); line-height: 1.5; }
      code {
        padding: 1px 6px; border-radius: 4px;
        background: #f1f5f9; color: #334155;
        font-family: 'Cascadia Code', 'Fira Code', monospace;
        font-size: 0.74rem;
      }
    }
    .setup-step-number {
      width: 26px; height: 26px; border-radius: 50%;
      background: #3f51b5; color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.72rem; font-weight: 700; flex-shrink: 0;
    }
    .setup-example-block {
      border-radius: 8px; overflow: hidden;
      border: 1px solid #e5e7eb; margin-top: 6px;
    }
    .setup-example-block-header {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 12px; background: #f5f5f5;
      border-bottom: 1px solid #e5e7eb;
      font-size: 0.72rem; font-weight: 600; color: rgba(0,0,0,0.5);
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }
    .setup-example-block-code {
      display: block; margin: 0; padding: 12px 14px;
      background: #1a1a2e; color: #c4b5fd;
      font-family: 'Cascadia Code', 'Fira Code', monospace;
      font-size: 0.76rem; line-height: 1.7;
      white-space: pre-wrap; word-break: break-word;
    }

    .skill-tip {
      display: flex; gap: 10px; align-items: flex-start;
      padding: 14px 16px; border-radius: 10px; margin-top: 20px;
      background: #fffbeb; border: 1px solid #fef3c7;
      > mat-icon { color: #f59e0b; flex-shrink: 0; margin-top: 2px; }
      strong { font-size: 0.82rem; color: #78350f; display: block; margin-bottom: 4px; }
      p { margin: 0; font-size: 0.76rem; color: #92400e; line-height: 1.6; }
      code {
        padding: 1px 6px; border-radius: 4px;
        background: rgba(120,53,15,0.1); font-size: 0.74rem;
        font-family: 'Cascadia Code', 'Fira Code', monospace;
      }
    }
  `],
})
export class SkillsTabComponent {
  protected readonly state = inject(FrameworkStateService);
  protected readonly clipboard = inject(ClipboardService);

  expandedSkill: string | null = null;

  readonly skills = computed(() => {
    const mode = this.state.mode();
    return mode ? getSkills(mode) : [];
  });

  toggleSkill(id: string): void {
    this.expandedSkill = this.expandedSkill === id ? null : id;
  }

  copy(text: string, id: string, event: Event): void {
    event.stopPropagation();
    this.clipboard.copy(text, id);
  }
}
