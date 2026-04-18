import { Component, input, output, inject } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { TranslationService, AppLanguage } from '../../core/i18n/translation.service';
import { ProposalRoleType } from '../../shared/models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [UpperCasePipe, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatBadgeModule, MatDividerModule],
  templateUrl: './header.component.html',
  styles: [`
    .app-header {
      background: white;
      border-bottom: 1px solid rgba(0,0,0,0.08);
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      z-index: 100;
    }
    .spacer { flex: 1; }
    .empty-notifications { padding: 16px 24px; color: rgba(0,0,0,0.5); }
    .header-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      object-fit: cover; border: 2px solid #e8e4f3;
    }
    .user-btn { overflow: visible; }
    .user-info {
      padding: 12px 16px; border-bottom: 1px solid rgba(0,0,0,0.08);
      display: flex; align-items: center; gap: 10px;
    }
    .menu-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      object-fit: cover; border: 2px solid #e8e4f3; flex-shrink: 0;
    }
    .user-info-text { display: flex; flex-direction: column; gap: 1px; }
    .user-info-name { font-weight: 600; font-size: 0.9rem; }
    .user-info-email { font-size: 0.72rem; color: rgba(0,0,0,0.45); }
    .user-info-group {
      display: flex; align-items: center; gap: 3px;
      font-size: 0.7rem; color: #7c3aed;
      mat-icon { font-size: 12px; width: 12px; height: 12px; }
    }
    .lang-btn { font-size: 13px; min-width: auto; padding: 0 8px; }
    .role-check { font-size: 18px; width: 18px; height: 18px; margin-left: 8px; color: #da6ccf; }
    .role-section-label {
      padding: 8px 16px 4px; font-size: 0.7rem; color: rgba(0,0,0,0.4);
      text-transform: uppercase; letter-spacing: 0.5px;
    }
  `],
})
export class HeaderComponent {
  toggleSidebar = output();
  protected readonly authService = inject(AuthService);
  protected readonly notificationService = inject(NotificationService);
  protected readonly i18n = inject(TranslationService);

  readonly langOptions: { value: AppLanguage; label: string; flag: string }[] = [
    { value: 'es', label: 'Español', flag: '🇪🇸' },
    { value: 'en', label: 'English', flag: '🇺🇸' },
  ];

  setLanguage(lang: AppLanguage): void {
    this.i18n.setLanguage(lang);
  }

  readonly proposalRoles: { value: ProposalRoleType; label: string; icon: string }[] = [
    { value: 'builder', label: 'Constructor', icon: 'architecture' },
    { value: 'reviewer', label: 'Revisor', icon: 'rate_review' },
    { value: 'approver', label: 'Aprobador/a', icon: 'verified' },
  ];

  roleLabel(role: string): string {
    return { builder: 'Constructor', reviewer: 'Revisor', approver: 'Aprobador/a' }[role] ?? role;
  }

  switchRole(role: ProposalRoleType): void {
    this.authService.switchProposalRole(role);
  }
}
