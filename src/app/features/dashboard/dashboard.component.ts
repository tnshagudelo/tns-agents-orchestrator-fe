import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AgentService } from '../agents/services/agent.service';
import { OrchestrationService } from '../orchestration/services/orchestration.service';
import { MonitoringService } from '../monitoring/services/monitoring.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styles: [`
    .page-container { padding: 24px; }
    h1 { margin: 0; font-size: 2rem; font-weight: 700; }
    .subtitle { color: rgba(0,0,0,0.5); margin: 4px 0 32px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; margin-bottom: 40px; }
    .kpi-card {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 24px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
      mat-icon { font-size: 2.5rem; width: 2.5rem; height: 2.5rem; margin-bottom: 12px; }
      &--agents mat-icon { color: #3f51b5; }
      &--pipelines mat-icon { color: #9c27b0; }
      &--logs mat-icon { color: #00897b; }
    }
    .kpi-value { font-size: 3rem; font-weight: 800; line-height: 1; }
    .kpi-label { font-size: 1rem; font-weight: 600; color: rgba(0,0,0,0.7); margin-top: 4px; }
    .kpi-sub { font-size: 0.8rem; color: rgba(0,0,0,0.4); margin-top: 4px; }
    .quick-actions h2 { margin: 0 0 16px; }
    .action-buttons { display: flex; gap: 12px; flex-wrap: wrap; }
  `],
})
export class DashboardComponent implements OnInit {
  protected readonly agentService = inject(AgentService);
  protected readonly orchestrationService = inject(OrchestrationService);
  protected readonly monitoringService = inject(MonitoringService);

  ngOnInit(): void {
    this.agentService.loadAgents().subscribe();
    this.orchestrationService.loadPipelines().subscribe();
    this.monitoringService.loadLogs().subscribe();
  }
}
