import { Component, input, output } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Agent } from '../../../../shared/models';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-agent-card',
  standalone: true,
  imports: [UpperCasePipe, MatCardModule, MatButtonModule, MatIconModule, MatTooltipModule, StatusBadgeComponent],
  templateUrl: './agent-card.component.html',
  styles: [`
    .agent-card {
      margin: 8px;
      transition: box-shadow 0.3s ease;
      &:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
      &--running { border-left: 4px solid #4caf50; }
    }
    .agent-description { color: rgba(0,0,0,0.6); font-size: 0.875rem; margin-bottom: 8px; }
    .agent-model { font-size: 0.8rem; color: rgba(0,0,0,0.5); display: flex; align-items: center; gap: 4px; }
    mat-card-header { justify-content: space-between; }
  `],
})
export class AgentCardComponent {
  agent = input.required<Agent>();
  view = output<Agent>();
  start = output<string>();
  stop = output<string>();
  edit = output<Agent>();
  delete = output<string>();
}
