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
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Settings</h1>
      </div>

      <div class="settings-grid">
        <mat-card>
          <mat-card-header>
            <mat-card-title>API Configuration</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="apiForm" (ngSubmit)="saveApiSettings()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>API Base URL</mat-label>
                <input matInput formControlName="apiUrl" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>WebSocket URL</mat-label>
                <input matInput formControlName="wsUrl" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>API Timeout (ms)</mat-label>
                <input matInput type="number" formControlName="timeout" />
              </mat-form-field>
              <button mat-raised-button color="primary" type="submit">
                Save API Settings
              </button>
            </form>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>Preferences</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="prefForm" (ngSubmit)="savePreferences()">
              <div class="toggle-row">
                <label>Dark Mode</label>
                <mat-slide-toggle formControlName="darkMode" />
              </div>
              <mat-divider />
              <div class="toggle-row">
                <label>Desktop Notifications</label>
                <mat-slide-toggle formControlName="notifications" />
              </div>
              <mat-divider />
              <div class="toggle-row">
                <label>Auto-refresh Monitoring</label>
                <mat-slide-toggle formControlName="autoRefresh" />
              </div>
              <div class="pref-actions">
                <button mat-raised-button color="primary" type="submit">
                  Save Preferences
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
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
