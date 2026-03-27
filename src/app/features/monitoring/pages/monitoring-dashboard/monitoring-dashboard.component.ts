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
  templateUrl: './monitoring-dashboard.component.html',
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
