import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { LogEntry } from '../../../../shared/models';

@Component({
  selector: 'app-log-viewer',
  standalone: true,
  imports: [DatePipe, MatIconModule],
  templateUrl: './log-viewer.component.html',
  styles: [`
    .log-viewer {
      background: #1e1e1e;
      border-radius: 8px;
      padding: 12px;
      font-family: 'Courier New', monospace;
      font-size: 0.8rem;
      max-height: 500px;
      overflow-y: auto;
      color: #d4d4d4;
    }
    .log-empty { color: #666; text-align: center; padding: 32px; }
    .log-entry {
      display: flex;
      gap: 12px;
      padding: 4px 0;
      border-bottom: 1px solid #2d2d2d;
      align-items: baseline;
      &--debug .log-level { color: #888; }
      &--info .log-level { color: #4fc3f7; }
      &--warning .log-level { color: #ffb74d; }
      &--error .log-level { color: #ef5350; }
    }
    .log-time { color: #888; white-space: nowrap; min-width: 80px; }
    .log-level { font-weight: 700; min-width: 60px; }
    .log-message { flex: 1; word-break: break-word; }
    .log-agent { color: #a5d6a7; font-size: 0.75rem; white-space: nowrap; }
  `],
})
export class LogViewerComponent {
  logs = input.required<LogEntry[]>();
}
