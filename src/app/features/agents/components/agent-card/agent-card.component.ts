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
  template: `
    <mat-card class="agent-card" [class.agent-card--running]="agent().status === 'running'">
      <mat-card-header>
        <mat-card-title>{{ agent().name }}</mat-card-title>
        <mat-card-subtitle>{{ agent().type | uppercase }}</mat-card-subtitle>
        <app-status-badge [status]="agent().status" />
      </mat-card-header>
      <mat-card-content>
        <p class="agent-description">{{ agent().description }}</p>
        @if (agent().model) {
          <span class="agent-model">
            <mat-icon inline>model_training</mat-icon> {{ agent().model }}
          </span>
        }
      </mat-card-content>
      <mat-card-actions>
        <button mat-icon-button matTooltip="View details" (click)="view.emit(agent())">
          <mat-icon>visibility</mat-icon>
        </button>
        @if (agent().status !== 'running') {
          <button mat-icon-button color="primary" matTooltip="Start agent" (click)="start.emit(agent().id)">
            <mat-icon>play_arrow</mat-icon>
          </button>
        } @else {
          <button mat-icon-button color="warn" matTooltip="Stop agent" (click)="stop.emit(agent().id)">
            <mat-icon>stop</mat-icon>
          </button>
        }
        <button mat-icon-button matTooltip="Edit agent" (click)="edit.emit(agent())">
          <mat-icon>edit</mat-icon>
        </button>
        <button mat-icon-button color="warn" matTooltip="Delete agent" (click)="delete.emit(agent().id)">
          <mat-icon>delete</mat-icon>
        </button>
      </mat-card-actions>
    </mat-card>
  `,
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
