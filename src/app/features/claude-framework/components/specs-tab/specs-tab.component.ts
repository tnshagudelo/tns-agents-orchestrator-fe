import { Component, inject, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MarkdownModule } from 'ngx-markdown';
import { FrameworkStateService } from '../../services/framework-state.service';
import { ClipboardService } from '../../services/clipboard.service';
import { SPEC_TIPS, getSpecFiles, generateIndexMd } from '../../data/system-spec.data';
import { SpecFile } from '../../models/framework.types';

@Component({
  selector: 'app-specs-tab',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatCardModule, MarkdownModule],
  templateUrl: './specs-tab.component.html',
  styles: [`
    .section-title {
      display: flex; align-items: center; gap: 8px;
      font-size: 1rem; font-weight: 600; margin: 0 0 14px; color: #1a1a2e;
      mat-icon { color: #3f51b5; }
    }
    .section-desc { font-size: 0.82rem; color: rgba(0,0,0,0.5); margin: -8px 0 16px; }

    /* Tips */
    .tips-section { margin-bottom: 28px; }
    .tips-grid { display: flex; flex-direction: column; gap: 10px; }
    .tip-card {
      display: flex; gap: 12px; align-items: flex-start;
      padding: 14px 16px; border-radius: 8px;
      background: #f8f7ff; border: 1px solid #e8e4f3;
    }
    .tip-icon { color: #5c6bc0; flex-shrink: 0; margin-top: 2px; }
    .tip-content { flex: 1; }
    .tip-title { font-weight: 600; font-size: 0.88rem; display: block; margin-bottom: 4px; }
    .tip-desc { margin: 0; font-size: 0.8rem; color: rgba(0,0,0,0.6); line-height: 1.5; }

    /* Index */
    .index-section { margin-bottom: 28px; }
    .index-header {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;
    }
    .file-label {
      display: flex; align-items: center; gap: 6px;
      font-weight: 600; font-size: 0.9rem; color: #3f51b5;
      mat-icon { font-size: 1.2rem; width: 1.2rem; height: 1.2rem; }
    }
    .index-preview {
      background: white; border: 1px solid rgba(0,0,0,0.08); border-radius: 10px;
      padding: 20px; max-height: 400px; overflow-y: auto;
      ::ng-deep h1 { font-size: 1.1rem; color: #3f51b5; }
      ::ng-deep h2 { font-size: 0.95rem; color: #5c6bc0; margin-top: 16px; }
      ::ng-deep table { width: 100%; border-collapse: collapse; font-size: 0.8rem; margin: 8px 0; }
      ::ng-deep th { background: #e8eaf6; padding: 6px 10px; border: 1px solid #c5cae9; text-align: left; font-weight: 600; }
      ::ng-deep td { padding: 6px 10px; border: 1px solid #e5e7eb; }
      ::ng-deep code { background: #e8eaf6; color: #283593; padding: 1px 5px; border-radius: 3px; font-size: 0.78rem; }
      ::ng-deep blockquote { border-left: 3px solid #5c6bc0; padding: 6px 12px; background: #f8f7ff; margin: 8px 0; font-size: 0.82rem; color: rgba(0,0,0,0.6); }
      ::ng-deep ol, ::ng-deep ul { padding-left: 20px; font-size: 0.82rem; }
      ::ng-deep li { margin: 3px 0; }
    }

    /* Specs */
    .specs-section { margin-bottom: 28px; }
    .spec-card {
      padding: 0; overflow: hidden; border-radius: 10px; margin-bottom: 12px;
    }
    .spec-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 16px; background: #f5f5f5; border-bottom: 1px solid rgba(0,0,0,0.06);
    }
    .spec-name {
      display: flex; align-items: center; gap: 6px;
      font-weight: 600; font-size: 0.85rem;
      mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; color: #5c6bc0; }
    }
    .spec-purpose {
      margin: 0; padding: 10px 16px; font-size: 0.82rem; color: rgba(0,0,0,0.6); line-height: 1.5;
      border-bottom: 1px solid rgba(0,0,0,0.04);
    }
    .spec-details {
      summary {
        padding: 8px 16px; font-size: 0.8rem; color: #3f51b5; cursor: pointer; font-weight: 500;
        &:hover { background: #f8f7ff; }
      }
    }
    .spec-example {
      margin: 0; padding: 16px;
      font-family: 'Roboto Mono', monospace; font-size: 0.78rem;
      line-height: 1.6; white-space: pre-wrap; word-break: break-word;
      background: #1a1a2e; color: #a5d6ff; border-radius: 0;
    }

    /* Structure */
    .structure-section { margin-bottom: 12px; }
    .structure-tree {
      margin: 0; padding: 16px 20px;
      font-family: 'Roboto Mono', monospace; font-size: 0.82rem; line-height: 1.8;
      background: #1a1a2e; color: #cdd6f4; border-radius: 8px;
      white-space: pre; overflow-x: auto;
    }
  `],
})
export class SpecsTabComponent {
  private readonly state = inject(FrameworkStateService);
  protected readonly clipboard = inject(ClipboardService);

  readonly tips = SPEC_TIPS;

  readonly specFiles = computed(() => {
    const tech = this.state.techId();
    return tech ? getSpecFiles(tech) : [];
  });

  readonly indexContent = computed(() => {
    const tech = this.state.techId();
    return tech ? generateIndexMd(tech) : '';
  });

  copyIndex(): void {
    this.clipboard.copy(this.indexContent(), 'spec-index');
  }

  copySpec(spec: SpecFile): void {
    this.clipboard.copy(spec.example, 'spec-' + spec.name);
  }
}
