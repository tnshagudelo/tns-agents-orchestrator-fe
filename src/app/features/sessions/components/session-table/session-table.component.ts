import { Component, input } from '@angular/core';
import { DatePipe, DecimalPipe, SlicePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AgentSession, SessionStatus } from '../../../../shared/models';

@Component({
  selector: 'app-session-table',
  standalone: true,
  imports: [DatePipe, DecimalPipe, SlicePipe, MatTableModule, MatChipsModule, MatIconModule, MatTooltipModule],
  templateUrl: './session-table.component.html',
  styles: [`
    .table-wrapper { overflow-x: auto; }

    .sessions-table { width: 100%; }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 48px;
      color: rgba(0,0,0,0.4);
      mat-icon { font-size: 3rem; width: 3rem; height: 3rem; }
    }

    .agent-name { display: block; font-weight: 500; }
    .agent-id { font-size: 0.75rem; color: rgba(0,0,0,0.45); font-family: monospace; }

    .running-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #1976d2;
      font-size: 0.85rem;
    }

    .spin { animation: spin 1.5s linear infinite; font-size: 1rem; width: 1rem; height: 1rem; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    mat-chip {
      text-transform: capitalize;
      font-size: 0.78rem;
      mat-icon { font-size: 0.9rem; width: 0.9rem; height: 0.9rem; margin-right: 4px; }
    }
    .status-active    { --mdc-chip-label-text-color: #1565c0; background: #e3f2fd !important; }
    .status-completed { --mdc-chip-label-text-color: #2e7d32; background: #e8f5e9 !important; }
    .status-error     { --mdc-chip-label-text-color: #c62828; background: #ffebee !important; }
    .status-timeout   { --mdc-chip-label-text-color: #e65100; background: #fff3e0 !important; }

    .session-row:hover { background: rgba(0,0,0,0.03); }
  `],
})
export class SessionTableComponent {
  sessions = input.required<AgentSession[]>();

  readonly columns = ['status', 'agentName', 'startedAt', 'duration', 'messageCount', 'tokensUsed'];

  statusIcon(status: SessionStatus): string {
    return { active: 'play_circle', completed: 'check_circle', error: 'error', timeout: 'timer_off' }[status];
  }

  formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}m ${rs}s`;
  }
}
