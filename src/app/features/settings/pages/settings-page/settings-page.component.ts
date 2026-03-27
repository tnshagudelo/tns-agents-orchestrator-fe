import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatCardModule,
    MatDividerModule,
  ],
  templateUrl: './settings-page.component.html',
  styles: [`
    .page-container { padding: 24px; }
    .page-header h1 { margin: 0 0 24px; font-size: 1.75rem; font-weight: 600; }
    .settings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 24px; }
    .full-width { width: 100%; margin-bottom: 8px; }
    .toggle-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; }
    mat-divider { margin: 0 !important; }
    .pref-actions { margin-top: 24px; }
  `],
})
export class SettingsPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);

  apiForm = this.fb.group({
    apiUrl: ['http://localhost:3000/api'],
    wsUrl: ['ws://localhost:3000/ws'],
    timeout: [30000],
  });

  prefForm = this.fb.group({
    darkMode: [false],
    notifications: [true],
    autoRefresh: [true],
  });

  saveApiSettings(): void {
    this.notifications.success('API settings saved');
  }

  savePreferences(): void {
    this.notifications.success('Preferences saved');
  }
}
