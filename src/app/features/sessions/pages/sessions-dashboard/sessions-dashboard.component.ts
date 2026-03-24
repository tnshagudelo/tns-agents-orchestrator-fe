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
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Sesiones de Agentes</h1>
        <div class="header-actions">
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Filtrar por ID de Agente</mat-label>
            <mat-icon matPrefix>search</mat-icon>
            <input matInput [(ngModel)]="agentFilter" placeholder="ID del agente..." (keyup.enter)="applyFilter()" />
          </mat-form-field>
          <button mat-stroked-button (click)="clearFilter()" [disabled]="!agentFilter">
            <mat-icon>clear</mat-icon> Limpiar
          </button>
          <button mat-raised-button color="primary" (click)="refresh()">
            <mat-icon>refresh</mat-icon> Actualizar
          </button>
        </div>
      </div>

      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-icon color="primary">history</mat-icon>
          <span class="stat-value">{{ sessionsService.total() | number }}</span>
          <span class="stat-label">Total de sesiones</span>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon style="color:#1565c0">play_circle</mat-icon>
          <span class="stat-value">{{ activeSessions() }}</span>
          <span class="stat-label">Activas</span>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon style="color:#2e7d32">check_circle</mat-icon>
          <span class="stat-value">{{ completedSessions() }}</span>
          <span class="stat-label">Completadas</span>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon color="warn">error</mat-icon>
          <span class="stat-value">{{ errorSessions() }}</span>
          <span class="stat-label">Errores</span>
        </mat-card>
      </div>

      <mat-card class="table-card">
        <mat-card-header>
          <mat-card-title>Historial de sesiones</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (sessionsService.isLoading()) {
            <div class="loading-row">
              <mat-icon class="spin">sync</mat-icon> Cargando sesiones...
            </div>
          } @else {
            <app-session-table [sessions]="sessionsService.sessions()" />
            <mat-paginator
              [length]="sessionsService.total()"
              [pageSize]="pageSize"
              [pageSizeOptions]="[10, 20, 50]"
              (page)="onPage($event)"
              showFirstLastButtons />
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
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
