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
  template: `
    <div class="table-wrapper">
      @if (sessions().length === 0) {
        <div class="empty-state">
          <mat-icon>history</mat-icon>
          <span>No sessions found</span>
        </div>
      } @else {
        <table mat-table [dataSource]="sessions()" class="sessions-table">

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let s">
              <mat-chip [class]="'status-' + s.status" disableRipple>
                <mat-icon>{{ statusIcon(s.status) }}</mat-icon>
                {{ s.status }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="agentName">
            <th mat-header-cell *matHeaderCellDef>Agent</th>
            <td mat-cell *matCellDef="let s">
              <span class="agent-name">{{ s.agentName }}</span>
              <span class="agent-id" [matTooltip]="s.agentId">{{ s.agentId | slice:0:8 }}…</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="startedAt">
            <th mat-header-cell *matHeaderCellDef>Started</th>
            <td mat-cell *matCellDef="let s">{{ s.startedAt | date:'dd/MM/yyyy HH:mm:ss' }}</td>
          </ng-container>

          <ng-container matColumnDef="duration">
            <th mat-header-cell *matHeaderCellDef>Duration</th>
            <td mat-cell *matCellDef="let s">
              @if (s.durationMs != null) {
                {{ formatDuration(s.durationMs) }}
              } @else {
                <span class="running-indicator">
                  <mat-icon class="spin">sync</mat-icon> Running
                </span>
              }
            </td>
          </ng-container>

          <ng-container matColumnDef="messageCount">
            <th mat-header-cell *matHeaderCellDef>Messages</th>
            <td mat-cell *matCellDef="let s">{{ s.messageCount | number }}</td>
          </ng-container>

          <ng-container matColumnDef="tokensUsed">
            <th mat-header-cell *matHeaderCellDef>Tokens</th>
            <td mat-cell *matCellDef="let s">
              {{ s.tokensUsed != null ? (s.tokensUsed | number) : '—' }}
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;" class="session-row"></tr>
        </table>
      }
    </div>
  `,
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
