import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './notification-toast.component.html',
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 10000;
      max-width: 400px;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease;
      color: white;
      min-width: 280px;

      &--success { background: #2e7d32; }
      &--error   { background: #c62828; }
      &--warning { background: #e65100; }
      &--info    { background: #1565c0; }
    }
    .toast-icon { flex-shrink: 0; }
    .toast-message { flex: 1; font-size: 0.9rem; }
    .toast-close { color: rgba(255,255,255,0.8); }
    @keyframes slideIn {
      from { transform: translateX(120%); opacity: 0; }
      to   { transform: translateX(0); opacity: 1; }
    }
  `],
})
export class NotificationToastComponent {
  protected readonly notificationService = inject(NotificationService);

  iconForType(type: string): string {
    const icons: Record<string, string> = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info',
    };
    return icons[type] ?? 'info';
  }
}
