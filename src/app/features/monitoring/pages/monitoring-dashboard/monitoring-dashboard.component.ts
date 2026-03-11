import { Component, inject, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MonitoringService } from '../../services/monitoring.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { LogViewerComponent } from '../../components/log-viewer/log-viewer.component';

@Component({
  selector: 'app-monitoring-dashboard',
  standalone: true,
  imports: [DecimalPipe, MatButtonModule, MatIconModule, MatCardModule, LogViewerComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Monitoring</h1>
        <div class="header-actions">
          <button mat-stroked-button (click)="clearLogs()">
            <mat-icon>clear_all</mat-icon> Clear Logs
          </button>
          <button mat-raised-button color="primary" (click)="refresh()">
            <mat-icon>refresh</mat-icon> Refresh
          </button>
        </div>
      </div>

      @if (monitoringService.metrics(); as metrics) {
        <div class="metrics-grid">
          <mat-card class="metric-card">
            <mat-icon color="primary">smart_toy</mat-icon>
            <span class="metric-value">{{ metrics.activeAgents }}</span>
            <span class="metric-label">Active Agents</span>
          </mat-card>
          <mat-card class="metric-card">
            <mat-icon color="accent">account_tree</mat-icon>
            <span class="metric-value">{{ metrics.runningPipelines }}</span>
            <span class="metric-label">Running Pipelines</span>
          </mat-card>
          <mat-card class="metric-card">
            <mat-icon color="warn">error</mat-icon>
            <span class="metric-value">{{ metrics.errorCount }}</span>
            <span class="metric-label">Errors</span>
          </mat-card>
          <mat-card class="metric-card">
            <mat-icon style="color:#4caf50">check_circle</mat-icon>
            <span class="metric-value">{{ metrics.successRate | number:'1.0-1' }}%</span>
            <span class="metric-label">Success Rate</span>
          </mat-card>
          <mat-card class="metric-card">
            <mat-icon>speed</mat-icon>
            <span class="metric-value">{{ metrics.avgResponseTimeMs }}ms</span>
            <span class="metric-label">Avg Response Time</span>
          </mat-card>
        </div>
      }

      <mat-card class="logs-card">
        <mat-card-header>
          <mat-card-title>System Logs</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <app-log-viewer [logs]="monitoringService.logs()" />
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 1.75rem; font-weight: 600; }
    .header-actions { display: flex; gap: 8px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .metric-card { display: flex; flex-direction: column; align-items: center; padding: 20px 12px; gap: 8px; }
    .metric-card mat-icon { font-size: 2rem; width: 2rem; height: 2rem; }
    .metric-value { font-size: 2rem; font-weight: 700; line-height: 1; }
    .metric-label { font-size: 0.8rem; color: rgba(0,0,0,0.5); text-align: center; }
    .logs-card { margin-top: 8px; }
    .logs-card mat-card-content { padding: 16px; }
  `],
})
export class MonitoringDashboardComponent implements OnInit {
  protected readonly monitoringService = inject(MonitoringService);
  private readonly notifications = inject(NotificationService);

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.monitoringService.loadLogs().subscribe({
      error: () => this.notifications.error('Failed to load logs'),
    });
    this.monitoringService.loadMetrics().subscribe({
      error: () => {
        // Metrics may not be available
      },
    });
  }

  clearLogs(): void {
    this.monitoringService.clearLogs();
  }
}
