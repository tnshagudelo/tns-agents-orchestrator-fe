import { Component, inject, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FrameworkStateService } from '../../services/framework-state.service';
import { ClipboardService } from '../../services/clipboard.service';
import { getTechnology } from '../../data/technologies.data';

@Component({
  selector: 'app-conventions-tab',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './conventions-tab.component.html',
  styles: [`
    .section { margin-bottom: 28px; }
    .section-title {
      display: flex; align-items: center; gap: 8px;
      font-size: 1rem; font-weight: 600; margin: 0 0 14px;
    }

    .items-list { display: flex; flex-direction: column; gap: 8px; }
    .item-row {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 10px 14px; border-radius: 8px;
      font-size: 0.85rem; line-height: 1.5;
      mat-icon { font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; margin-top: 1px; }
    }
    .item--convention {
      background: #f0fdf4; border: 1px solid #dcfce7;
    }
    .item--restriction {
      background: #fef2f2; border: 1px solid #fee2e2;
    }

    .icon-success { color: #16a34a; }
    .icon-danger { color: #dc2626; }
    .icon-info { color: #3f51b5; }

    .commands-table { display: flex; flex-direction: column; gap: 6px; }
    .command-row {
      display: flex; align-items: center; gap: 12px;
      padding: 8px 14px; border-radius: 8px;
      background: #f5f5f5; border: 1px solid rgba(0,0,0,0.06);
    }
    .command-key {
      min-width: 100px; font-weight: 600; font-size: 0.82rem; color: rgba(0,0,0,0.65);
    }
    .command-value {
      flex: 1;
      font-family: 'Roboto Mono', monospace; font-size: 0.8rem;
      color: #283593; word-break: break-all;
    }
  `],
})
export class ConventionsTabComponent {
  private readonly state = inject(FrameworkStateService);
  protected readonly clipboard = inject(ClipboardService);

  readonly tech = computed(() => {
    const id = this.state.techId();
    return id ? getTechnology(id) : undefined;
  });

  readonly commandEntries = computed(() => {
    const t = this.tech();
    return t ? Object.entries(t.commands) : [];
  });

  copy(text: string, id: string): void {
    this.clipboard.copy(text, id);
  }
}
