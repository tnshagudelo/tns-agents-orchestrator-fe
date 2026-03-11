import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { OrchestrationService } from '../../services/orchestration.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { Pipeline } from '../../../../shared/models';

@Component({
  selector: 'app-orchestration-board',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatCardModule, MatChipsModule, StatusBadgeComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Orchestration</h1>
        <button mat-raised-button color="primary" (click)="createPipeline()">
          <mat-icon>add</mat-icon> New Pipeline
        </button>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-value">{{ orchestrationService.pipelines().length }}</span>
          <span class="stat-label">Total Pipelines</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ orchestrationService.activeRuns().length }}</span>
          <span class="stat-label">Active Runs</span>
        </div>
      </div>

      @if (orchestrationService.isLoading()) {
        <div class="loading-state">Loading pipelines...</div>
      } @else if (orchestrationService.pipelines().length === 0) {
        <div class="empty-state">
          <mat-icon>account_tree</mat-icon>
          <p>No pipelines yet. Create your first orchestration pipeline!</p>
          <button mat-raised-button color="primary" (click)="createPipeline()">
            Create Pipeline
          </button>
        </div>
      } @else {
        <div class="pipeline-grid">
          @for (pipeline of orchestrationService.pipelines(); track pipeline.id) {
            <mat-card class="pipeline-card">
              <mat-card-header>
                <mat-card-title>{{ pipeline.name }}</mat-card-title>
                <app-status-badge [status]="pipeline.status" />
              </mat-card-header>
              <mat-card-content>
                <p>{{ pipeline.description }}</p>
                <div class="pipeline-meta">
                  <mat-chip-set>
                    <mat-chip>{{ pipeline.nodes.length }} nodes</mat-chip>
                    <mat-chip>{{ pipeline.edges.length }} connections</mat-chip>
                  </mat-chip-set>
                </div>
              </mat-card-content>
              <mat-card-actions>
                <button mat-icon-button (click)="viewPipeline(pipeline)">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button color="primary" (click)="runPipeline(pipeline.id)">
                  <mat-icon>play_arrow</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deletePipeline(pipeline.id)">
                  <mat-icon>delete</mat-icon>
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 1.75rem; font-weight: 600; }
    .stats-row { display: flex; gap: 16px; margin-bottom: 24px; }
    .stat-card { background: white; border-radius: 12px; padding: 20px 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-align: center; min-width: 140px; }
    .stat-value { display: block; font-size: 2.5rem; font-weight: 700; color: #3f51b5; }
    .stat-label { font-size: 0.875rem; color: rgba(0,0,0,0.5); }
    .pipeline-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
    .pipeline-card { transition: box-shadow 0.3s; &:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.15); } }
    .pipeline-meta { margin-top: 8px; }
    .empty-state { text-align: center; padding: 80px; color: rgba(0,0,0,0.4); }
    .empty-state mat-icon { font-size: 80px; width: 80px; height: 80px; margin-bottom: 16px; }
    .loading-state { text-align: center; padding: 64px; }
  `],
})
export class OrchestrationBoardComponent implements OnInit {
  protected readonly orchestrationService = inject(OrchestrationService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);

  ngOnInit(): void {
    this.orchestrationService.loadPipelines().subscribe({
      error: () => this.notifications.error('Failed to load pipelines'),
    });
  }

  createPipeline(): void {
    this.router.navigate(['/orchestration/create']);
  }

  viewPipeline(pipeline: Pipeline): void {
    this.router.navigate(['/orchestration', pipeline.id]);
  }

  runPipeline(id: string): void {
    this.orchestrationService.runPipeline(id).subscribe({
      next: () => this.notifications.success('Pipeline started'),
      error: () => this.notifications.error('Failed to run pipeline'),
    });
  }

  deletePipeline(id: string): void {
    this.orchestrationService.deletePipeline(id).subscribe({
      next: () => this.notifications.success('Pipeline deleted'),
      error: () => this.notifications.error('Failed to delete pipeline'),
    });
  }
}
