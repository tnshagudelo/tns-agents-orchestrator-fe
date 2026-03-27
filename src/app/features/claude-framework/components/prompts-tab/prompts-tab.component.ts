import { Component, inject, computed } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FrameworkStateService } from '../../services/framework-state.service';
import { ClipboardService } from '../../services/clipboard.service';
import { getPrompts } from '../../data/prompts.data';

@Component({
  selector: 'app-prompts-tab',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './prompts-tab.component.html',
  styles: [`
    .info-banner {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 16px; border-radius: 8px;
      background: #e3f2fd; color: #1565c0;
      margin-bottom: 20px;
      mat-icon { flex-shrink: 0; }
      span { font-size: 0.82rem; line-height: 1.5; }
    }

    .prompts-list { display: flex; flex-direction: column; gap: 16px; }

    .prompt-card {
      padding: 0; overflow: hidden;
      border-radius: 10px;
    }
    .prompt-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px;
      background: #f5f5f5;
      border-bottom: 1px solid rgba(0,0,0,0.08);
    }
    .prompt-label { font-weight: 600; font-size: 0.9rem; }

    .prompt-text {
      margin: 0; padding: 16px;
      font-family: 'Roboto Mono', monospace; font-size: 0.8rem;
      line-height: 1.7; white-space: pre-wrap; word-break: break-word;
      color: rgba(0,0,0,0.75);
      max-height: 400px; overflow-y: auto;
    }
  `],
})
export class PromptsTabComponent {
  protected readonly state = inject(FrameworkStateService);
  protected readonly clipboard = inject(ClipboardService);

  readonly prompts = computed(() => {
    const mode = this.state.mode();
    const tech = this.state.techId();
    return mode && tech ? getPrompts(mode, tech) : [];
  });

  copy(text: string, id: string): void {
    this.clipboard.copy(text, id);
  }
}
