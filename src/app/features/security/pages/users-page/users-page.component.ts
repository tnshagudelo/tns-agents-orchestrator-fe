import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { SecurityService, AppUserInfo, SecurityGroup } from '../../services/security.service';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [
    DatePipe, FormsModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule,
    MatSelectModule, MatFormFieldModule, MatChipsModule, MatTabsModule,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h2>Usuarios</h2>
          <p class="subtitle">Aprueba, rechaza y gestiona el acceso de los usuarios.</p>
        </div>
        <a mat-stroked-button routerLink="../groups"><mat-icon>shield</mat-icon> Grupos</a>
      </div>

      <mat-tab-group>
        <!-- Pending tab -->
        <mat-tab>
          <ng-template mat-tab-label>
            Pendientes
            @if (pendingUsers().length > 0) {
              <span class="tab-badge">{{ pendingUsers().length }}</span>
            }
          </ng-template>
          <div class="tab-content">
            @if (pendingUsers().length === 0) {
              <div class="empty-state">
                <mat-icon>check_circle</mat-icon>
                <p>No hay usuarios pendientes de aprobacion.</p>
              </div>
            }
            @for (u of pendingUsers(); track u.id) {
              <mat-card class="user-card">
                <div class="user-info">
                  @if (u.avatarUrl) {
                    <img [src]="u.avatarUrl" class="avatar" alt="" />
                  } @else {
                    <mat-icon class="avatar-icon">person</mat-icon>
                  }
                  <div class="user-details">
                    <strong>{{ u.username }}</strong>
                    <span class="user-email">{{ u.email || 'Sin correo' }}</span>
                    <span class="user-date">Solicito acceso: {{ u.createdAt | date:'short' }}</span>
                  </div>
                </div>
                <div class="user-actions">
                  <mat-form-field appearance="outline" class="group-select">
                    <mat-label>Grupo</mat-label>
                    <mat-select [(ngModel)]="approveGroupId[u.id]">
                      @for (g of activeGroups(); track g.id) {
                        <mat-option [value]="g.id">{{ g.name }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                  <button mat-raised-button color="primary" (click)="approve(u)"
                    [disabled]="!approveGroupId[u.id]">
                    <mat-icon>check</mat-icon> Aprobar
                  </button>
                  <button mat-stroked-button color="warn" (click)="reject(u.id)">
                    <mat-icon>block</mat-icon> Rechazar
                  </button>
                </div>
              </mat-card>
            }
          </div>
        </mat-tab>

        <!-- Active tab -->
        <mat-tab label="Activos">
          <div class="tab-content">
            @for (u of activeUsers(); track u.id) {
              <mat-card class="user-card">
                <div class="user-info">
                  @if (u.avatarUrl) {
                    <img [src]="u.avatarUrl" class="avatar" alt="" />
                  } @else {
                    <mat-icon class="avatar-icon">person</mat-icon>
                  }
                  <div class="user-details">
                    <strong>{{ u.username }}</strong>
                    <span class="user-email">{{ u.email || 'Sin correo' }}</span>
                    <span class="user-group">
                      <mat-icon>shield</mat-icon> {{ u.groupName || 'Sin grupo' }}
                    </span>
                  </div>
                </div>
                <div class="user-actions">
                  <mat-form-field appearance="outline" class="group-select">
                    <mat-label>Grupo</mat-label>
                    <mat-select [ngModel]="u.groupId" (ngModelChange)="changeGroup(u.id, $event)">
                      @for (g of activeGroups(); track g.id) {
                        <mat-option [value]="g.id">{{ g.name }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                  <button mat-stroked-button color="warn" (click)="deactivate(u.id)">
                    <mat-icon>person_off</mat-icon> Desactivar
                  </button>
                </div>
              </mat-card>
            }
          </div>
        </mat-tab>

        <!-- Inactive tab -->
        <mat-tab label="Inactivos">
          <div class="tab-content">
            @if (inactiveUsers().length === 0) {
              <div class="empty-state">
                <mat-icon>info</mat-icon>
                <p>No hay usuarios inactivos.</p>
              </div>
            }
            @for (u of inactiveUsers(); track u.id) {
              <mat-card class="user-card user-card--inactive">
                <div class="user-info">
                  @if (u.avatarUrl) {
                    <img [src]="u.avatarUrl" class="avatar" alt="" />
                  } @else {
                    <mat-icon class="avatar-icon">person</mat-icon>
                  }
                  <div class="user-details">
                    <strong>{{ u.username }}</strong>
                    <span class="user-email">{{ u.email || 'Sin correo' }}</span>
                    <span class="user-group">
                      <mat-icon>shield</mat-icon> {{ u.groupName || 'Sin grupo' }}
                    </span>
                  </div>
                </div>
                <div class="user-actions">
                  <button mat-raised-button color="primary" (click)="activate(u.id)">
                    <mat-icon>person</mat-icon> Activar
                  </button>
                </div>
              </mat-card>
            }
          </div>
        </mat-tab>

        <!-- Rejected tab -->
        <mat-tab label="Rechazados">
          <div class="tab-content">
            @if (rejectedUsers().length === 0) {
              <div class="empty-state">
                <mat-icon>info</mat-icon>
                <p>No hay usuarios rechazados.</p>
              </div>
            }
            @for (u of rejectedUsers(); track u.id) {
              <mat-card class="user-card user-card--rejected">
                <div class="user-info">
                  @if (u.avatarUrl) {
                    <img [src]="u.avatarUrl" class="avatar" alt="" />
                  } @else {
                    <mat-icon class="avatar-icon">person</mat-icon>
                  }
                  <div class="user-details">
                    <strong>{{ u.username }}</strong>
                    <span class="user-email">{{ u.email || 'Sin correo' }}</span>
                  </div>
                </div>
                <div class="user-actions">
                  <button mat-stroked-button (click)="removeUser(u.id)">
                    <mat-icon>person_remove</mat-icon> Remover
                  </button>
                </div>
              </mat-card>
            }
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .page { padding: 32px; max-width: 900px; margin: 0 auto; }
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;
      h2 { margin: 0 0 4px; font-size: 22px; font-weight: 600; color: #1a1a2e; }
      .subtitle { margin: 0; font-size: 13px; color: #888; }
    }
    .tab-badge {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 20px; height: 20px; border-radius: 10px;
      background: #dc2626; color: white; font-size: 11px; font-weight: 700;
      margin-left: 6px; padding: 0 5px;
    }
    .tab-content { padding: 16px 0; display: flex; flex-direction: column; gap: 10px; }
    .user-card {
      border-radius: 12px !important;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06) !important;
      padding: 16px 20px !important;
      display: flex; justify-content: space-between; align-items: center;
      gap: 16px; flex-wrap: wrap;
      &--inactive { opacity: 0.6; }
      &--rejected { opacity: 0.5; }
    }
    .user-info { display: flex; align-items: center; gap: 12px; }
    .avatar {
      width: 40px; height: 40px; border-radius: 50%;
      object-fit: cover; border: 2px solid #e8e4f3;
    }
    .avatar-icon {
      width: 40px; height: 40px; font-size: 40px;
      color: #ccc; border-radius: 50%;
    }
    .user-details {
      display: flex; flex-direction: column; gap: 1px;
      strong { font-size: 14px; color: #1a1a2e; }
      .user-email { font-size: 12px; color: #888; }
      .user-date { font-size: 11px; color: #bbb; }
      .user-group {
        display: flex; align-items: center; gap: 3px;
        font-size: 12px; color: #7c3aed;
        mat-icon { font-size: 14px; width: 14px; height: 14px; }
      }
    }
    .user-actions {
      display: flex; align-items: center; gap: 8px;
      .group-select { width: 180px; }
      ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
    }
    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      padding: 40px 20px; color: #ccc;
      mat-icon { font-size: 48px; width: 48px; height: 48px; }
      p { margin: 12px 0 0; font-size: 14px; }
    }
  `],
})
export class UsersPageComponent implements OnInit {
  private readonly securityService = inject(SecurityService);

  readonly allUsers = this.securityService.users;
  readonly allGroups = this.securityService.groups;

  approveGroupId: Record<string, string> = {};

  ngOnInit(): void {
    this.securityService.loadUsers().subscribe();
    this.securityService.loadGroups().subscribe();
  }

  pendingUsers = () => this.allUsers().filter(u => u.status === 'pending');
  activeUsers = () => this.allUsers().filter(u => u.status === 'active');
  inactiveUsers = () => this.allUsers().filter(u => u.status === 'inactive');
  rejectedUsers = () => this.allUsers().filter(u => u.status === 'rejected');
  activeGroups = () => this.allGroups().filter(g => g.isActive);

  approve(u: AppUserInfo): void {
    const groupId = this.approveGroupId[u.id];
    if (!groupId) return;
    this.securityService.approveUser(u.id, groupId).subscribe();
  }

  reject(id: string): void {
    this.securityService.rejectUser(id).subscribe();
  }

  deactivate(id: string): void {
    this.securityService.deactivateUser(id).subscribe();
  }

  activate(id: string): void {
    this.securityService.activateUser(id).subscribe();
  }

  removeUser(id: string): void {
    this.securityService.removeUser(id).subscribe();
  }

  changeGroup(userId: string, groupId: string): void {
    this.securityService.changeUserGroup(userId, groupId).subscribe();
  }
}
