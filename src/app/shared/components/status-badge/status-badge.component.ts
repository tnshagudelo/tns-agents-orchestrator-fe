import { Component, input } from '@angular/core';
import { AgentStatus, PipelineStatus } from '../../models';

type Status = AgentStatus | PipelineStatus | string;

@Component({
  selector: 'app-status-badge',
  standalone: true,
  templateUrl: './status-badge.component.html',
  styles: [`
    .status-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;

      &--idle     { background: #e0e0e0; color: #616161; }
      &--running  { background: #e8f5e9; color: #2e7d32; }
      &--paused   { background: #fff3e0; color: #e65100; }
      &--error    { background: #ffebee; color: #c62828; }
      &--completed { background: #e3f2fd; color: #1565c0; }
      &--failed   { background: #ffebee; color: #c62828; }
      &--active   { background: #e8f5e9; color: #2e7d32; }
      &--draft    { background: #f3e5f5; color: #6a1b9a; }
    }
  `],
})
export class StatusBadgeComponent {
  status = input.required<Status>();
}
