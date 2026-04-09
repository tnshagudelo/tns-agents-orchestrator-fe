import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { SessionsService } from '../../services/sessions.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { SessionTableComponent } from '../../components/session-table/session-table.component';

@Component({
  selector: 'app-sessions-dashboard',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    SessionTableComponent,
  ],
  templateUrl: './sessions-dashboard.component.html',
  styles: [`
    .page-container { padding: 24px; }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 12px;
      h1 { margin: 0; font-size: 1.75rem; font-weight: 600; }
    }

    .header-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

    .filter-field { width: 220px; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px 12px;
      gap: 8px;
      mat-icon { font-size: 2rem; width: 2rem; height: 2rem; }
    }

    .stat-value { font-size: 2rem; font-weight: 700; line-height: 1; }
    .stat-label { font-size: 0.8rem; color: rgba(0,0,0,0.5); text-align: center; }

    .table-card mat-card-content { padding: 0 16px 16px; }

    .loading-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 48px;
      color: rgba(0,0,0,0.45);
    }

    .spin { animation: spin 1.5s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `],
})
export class SessionsDashboardComponent implements OnInit {
  protected readonly sessionsService = inject(SessionsService);
  private readonly notifications = inject(NotificationService);

  agentFilter = '';
  pageSize = 20;
  currentPage = 1;

  readonly activeSessions = () =>
    this.sessionsService.sessions().filter(s => s.status === 'active').length;
  readonly completedSessions = () =>
    this.sessionsService.sessions().filter(s => s.status === 'completed').length;
  readonly errorSessions = () =>
    this.sessionsService.sessions().filter(s => s.status === 'error').length;

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.sessionsService.loadSessions(this.currentPage, this.pageSize, this.agentFilter || undefined).subscribe({
      error: () => this.notifications.error('Failed to load sessions'),
    });
  }

  applyFilter(): void {
    this.currentPage = 1;
    this.refresh();
  }

  clearFilter(): void {
    this.agentFilter = '';
    this.applyFilter();
  }

  onPage(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.refresh();
  }
}
