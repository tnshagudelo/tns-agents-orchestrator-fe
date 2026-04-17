import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  imports: [MatProgressSpinnerModule, MatIconModule, MatButtonModule],
  template: `
    <div class="callback-container">
      @if (error) {
        <div class="callback-error">
          <mat-icon class="error-icon">error_outline</mat-icon>
          <h2>Error de autenticacion</h2>
          <p>{{ error }}</p>
          <button mat-flat-button color="primary" (click)="goToLogin()">
            Volver al login
          </button>
        </div>
      } @else {
        <mat-spinner diameter="48"></mat-spinner>
        <p class="callback-msg">Autenticando con GitHub...</p>
      }
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: 100vh;
      background: linear-gradient(160deg, #0d0d1a 0%, #1a1a2e 40%, #16213e 70%, #0f3460 100%);
      color: white;
    }
    .callback-msg { margin-top: 24px; color: rgba(255,255,255,0.6); }
    .callback-error {
      display: flex; flex-direction: column; align-items: center; gap: 12px;
      text-align: center;
    }
    .error-icon { font-size: 48px; width: 48px; height: 48px; color: #f44336; }
    .callback-error h2 { margin: 0; }
    .callback-error p { color: rgba(255,255,255,0.5); margin: 0 0 16px; }
  `],
})
export class OAuthCallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  error = '';

  ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('code');
    const state = this.route.snapshot.queryParamMap.get('state');
    const errorParam = this.route.snapshot.queryParamMap.get('error');

    if (errorParam) {
      this.error = this.route.snapshot.queryParamMap.get('error_description') || 'Autenticacion cancelada';
      return;
    }

    if (!code || !state) {
      this.error = 'Parametros de autenticacion incompletos';
      return;
    }

    this.authService.handleOAuthCallback(code, state).subscribe({
      next: () => this.router.navigateByUrl('/home'),
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Error al autenticar con GitHub';
      },
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
