import { Component, input, output, inject } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { TranslationService, AppLanguage } from '../../core/i18n/translation.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [UpperCasePipe, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatBadgeModule],
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
    .user-info {
      padding: 10px 16px; border-bottom: 1px solid rgba(0,0,0,0.08);
      display: flex; flex-direction: column; gap: 2px;
    }
    .user-info-name { font-weight: 600; font-size: 0.9rem; }
    .user-info-role { font-size: 0.72rem; color: rgba(0,0,0,0.45); }
    .lang-btn { font-size: 13px; min-width: auto; padding: 0 8px; }
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

  roleLabel(role: string): string {
    return { builder: 'Constructor', reviewer: 'Revisor', approver: 'Aprobador/a' }[role] ?? role;
  }
}
