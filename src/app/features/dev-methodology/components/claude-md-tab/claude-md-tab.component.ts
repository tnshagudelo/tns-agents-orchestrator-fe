import { Component, inject, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MarkdownModule } from 'ngx-markdown';
import { FrameworkStateService } from '../../services/framework-state.service';
import { ClipboardService } from '../../services/clipboard.service';
import { generateClaudeMd, generateMultiRepoClaudeMd } from '../../data/claude-md.data';

@Component({
  selector: 'app-claude-md-tab',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MarkdownModule],
  templateUrl: './claude-md-tab.component.html',
  styles: [`
    .claudemd-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 16px;
    }
    .file-label {
      display: flex; align-items: center; gap: 6px;
      font-weight: 600; font-size: 0.95rem; color: #3f51b5;
      mat-icon { font-size: 1.2rem; width: 1.2rem; height: 1.2rem; }
    }

    .claudemd-content {
      background: white;
      border: 1px solid rgba(0,0,0,0.08);
      border-radius: 10px;
      padding: 24px;
      max-height: 600px;
      overflow-y: auto;

      ::ng-deep h1 { font-size: 1.3rem; color: #3f51b5; border-bottom: 1px solid #e8eaf6; padding-bottom: 6px; }
      ::ng-deep h2 { font-size: 1.05rem; color: #5c6bc0; margin-top: 20px; }
      ::ng-deep code {
        background: #e8eaf6; color: #283593; padding: 1px 6px; border-radius: 4px;
        font-family: 'Roboto Mono', monospace; font-size: 0.82rem;
      }
      ::ng-deep pre {
        background: #1a1a2e; color: #a5d6ff; padding: 12px 16px; border-radius: 6px;
        overflow-x: auto; font-size: 0.8rem;
        code { background: transparent; color: inherit; padding: 0; }
      }
      ::ng-deep ul, ::ng-deep ol { padding-left: 20px; }
      ::ng-deep li { margin: 4px 0; font-size: 0.88rem; line-height: 1.6; }
      ::ng-deep strong { color: #1a237e; }
    }
  `],
})
export class ClaudeMdTabComponent {
  private readonly state = inject(FrameworkStateService);
  protected readonly clipboard = inject(ClipboardService);

  readonly content = computed(() => {
    const tech = this.state.techId();
    if (!tech) return '';
    return this.state.mode() === 'multi-repo'
      ? generateMultiRepoClaudeMd(tech)
      : generateClaudeMd(tech);
  });

  copyAll(): void {
    this.clipboard.copy(this.content(), 'claudemd-all');
  }
}
