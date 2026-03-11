import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, JsonPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { AgentService } from '../../services/agent.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-agent-detail',
  standalone: true,
  imports: [
    DatePipe,
    JsonPipe,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatDividerModule,
    StatusBadgeComponent,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <button mat-icon-button (click)="back()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ agent()?.name ?? 'Agent Detail' }}</h1>
        @if (agent()) {
          <app-status-badge [status]="agent()!.status" />
        }
        <div class="actions">
          <button mat-stroked-button (click)="edit()">
            <mat-icon>edit</mat-icon> Edit
          </button>
          @if (agent()?.status !== 'running') {
            <button mat-raised-button color="primary" (click)="start()">
              <mat-icon>play_arrow</mat-icon> Start
            </button>
          } @else {
            <button mat-raised-button color="warn" (click)="stop()">
              <mat-icon>stop</mat-icon> Stop
            </button>
          }
        </div>
      </div>

      @if (agent(); as a) {
        <mat-tab-group>
          <mat-tab label="Overview">
            <div class="tab-content">
              <div class="info-grid">
                <div class="info-item">
                  <label>Type</label>
                  <span>{{ a.type }}</span>
                </div>
                <div class="info-item">
                  <label>Model</label>
                  <span>{{ a.model ?? 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <label>Description</label>
                  <span>{{ a.description }}</span>
                </div>
                <div class="info-item">
                  <label>Created</label>
                  <span>{{ a.createdAt | date:'medium' }}</span>
                </div>
              </div>
              @if (a.tools?.length) {
                <h3>Tools</h3>
                <mat-chip-set>
                  @for (tool of a.tools; track tool) {
                    <mat-chip>{{ tool }}</mat-chip>
                  }
                </mat-chip-set>
              }
            </div>
          </mat-tab>
          <mat-tab label="Configuration">
            <div class="tab-content">
              <pre class="config-view">{{ a.config | json }}</pre>
            </div>
          </mat-tab>
        </mat-tab-group>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
    .page-header h1 { margin: 0; font-size: 1.75rem; flex: 1; }
    .actions { display: flex; gap: 8px; }
    .tab-content { padding: 24px 0; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .info-item label { display: block; font-size: 0.75rem; color: rgba(0,0,0,0.5); text-transform: uppercase; margin-bottom: 4px; }
    .config-view { background: #f5f5f5; padding: 16px; border-radius: 8px; overflow: auto; }
  `],
})
export class AgentDetailComponent implements OnInit {
  protected readonly agentService = inject(AgentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);

  agent = this.agentService.selectedAgent;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.agentService.loadAgent(id).subscribe({
        error: () => {
          this.notifications.error('Failed to load agent');
          this.router.navigate(['/agents']);
        },
      });
    }
  }

  back(): void {
    this.router.navigate(['/agents']);
  }

  edit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.router.navigate(['/agents', id, 'edit']);
  }

  start(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.agentService.startAgent(id).subscribe({
        next: () => this.notifications.success('Agent started'),
        error: () => this.notifications.error('Failed to start agent'),
      });
    }
  }

  stop(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.agentService.stopAgent(id).subscribe({
        next: () => this.notifications.success('Agent stopped'),
        error: () => this.notifications.error('Failed to stop agent'),
      });
    }
  }
}
