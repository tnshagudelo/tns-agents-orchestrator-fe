import { Component, input, output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatBadgeModule],
  template: `
    <mat-toolbar class="app-header">
      <button mat-icon-button (click)="toggleSidebar.emit()">
        <mat-icon>menu</mat-icon>
      </button>

      <span class="spacer"></span>

      <button mat-icon-button
        [matBadge]="notificationService.notifications().length || null"
        matBadgeColor="warn"
        [matMenuTriggerFor]="notifMenu">
        <mat-icon>notifications</mat-icon>
      </button>

      <mat-menu #notifMenu="matMenu">
        @if (notificationService.notifications().length === 0) {
          <div class="empty-notifications">Sin notificaciones nuevas</div>
        } @else {
          @for (n of notificationService.notifications(); track n.id) {
            <button mat-menu-item (click)="notificationService.dismiss(n.id)">
              <mat-icon [color]="n.type === 'error' ? 'warn' : n.type === 'success' ? 'primary' : ''">
                {{ n.type === 'error' ? 'error' : n.type === 'success' ? 'check_circle' : 'info' }}
              </mat-icon>
              <span>{{ n.message }}</span>
            </button>
          }
        }
      </mat-menu>

      <button mat-icon-button [matMenuTriggerFor]="userMenu">
        <mat-icon>account_circle</mat-icon>
      </button>

      <mat-menu #userMenu="matMenu">
        @if (authService.currentUser(); as user) {
          <div class="user-info">
            <span class="user-info-name">{{ user.username }}</span>
            <span class="user-info-role">{{ roleLabel(user.proposalRole) }}</span>
          </div>
        }
        <button mat-menu-item routerLink="/settings">
          <mat-icon>settings</mat-icon> Configuración
        </button>
        <button mat-menu-item (click)="authService.logout()">
          <mat-icon>logout</mat-icon> Cerrar sesión
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .app-header {
      background: white;
      border-bottom: 1px solid rgba(0,0,0,0.08);
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      z-index: 100;
    }
    .spacer { flex: 1; }
    .empty-notifications { padding: 16px 24px; color: rgba(0,0,0,0.5); }
    .user-info {
      padding: 10px 16px; border-bottom: 1px solid rgba(0,0,0,0.08);
      display: flex; flex-direction: column; gap: 2px;
    }
    .user-info-name { font-weight: 600; font-size: 0.9rem; }
    .user-info-role { font-size: 0.72rem; color: rgba(0,0,0,0.45); }
  `],
})
export class HeaderComponent {
  toggleSidebar = output();
  protected readonly authService = inject(AuthService);
  protected readonly notificationService = inject(NotificationService);

  roleLabel(role: string): string {
    return { builder: 'Constructor', reviewer: 'Revisor', approver: 'Aprobador/a' }[role] ?? role;
  }
}
