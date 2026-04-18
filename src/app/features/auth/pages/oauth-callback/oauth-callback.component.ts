import { Component, inject, OnInit, signal } from '@angular/core';
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
      @if (error()) {
        <div class="callback-error">
          @if (errorCode() === 'DOMAIN_NOT_ALLOWED') {
            <mat-icon class="error-icon domain-icon">block</mat-icon>
            <h2>Dominio no autorizado</h2>
            <p class="domain-error-detail">{{ error() }}</p>
            <p class="domain-error-hint">
              Si crees que esto es un error, contacta al administrador del sistema
              para que agregue tu dominio a la lista de dominios permitidos.
            </p>
          } @else if (errorCode() === 'PENDING_APPROVAL') {
            <mat-icon class="error-icon pending-icon">hourglass_top</mat-icon>
            <h2>Cuenta pendiente de aprobacion</h2>
            @if (errorUsername() || errorEmail()) {
              <div class="pending-user-info">
                @if (errorUsername()) {
                  <span class="pending-user-label">Usuario: <strong>{{ errorUsername() }}</strong></span>
                }
                @if (errorEmail()) {
                  <span class="pending-user-label">Correo: <strong>{{ errorEmail() }}</strong></span>
                }
              </div>
            }
            <p class="domain-error-detail">{{ error() }}</p>
            <p class="domain-error-hint">
              Un administrador revisara tu solicitud y te asignara un grupo de acceso.
              Intenta nuevamente mas tarde.
            </p>
          } @else if (errorCode() === 'USER_REJECTED') {
            <mat-icon class="error-icon">block</mat-icon>
            <h2>Acceso rechazado</h2>
            <p>{{ error() }}</p>
          } @else if (errorCode() === 'USER_INACTIVE') {
            <mat-icon class="error-icon">person_off</mat-icon>
            <h2>Cuenta desactivada</h2>
            <p>{{ error() }}</p>
            <p class="domain-error-hint">
              Tu cuenta ha sido desactivada. Contacta al administrador para mas informacion.
            </p>
          } @else if (errorCode() === 'NO_EMAIL') {
            <mat-icon class="error-icon email-icon">email</mat-icon>
            <h2>Correo no disponible</h2>
            <p>{{ error() }}</p>
          } @else if (errorCode() === 'INVALID_CODE') {
            <mat-icon class="error-icon">vpn_key_off</mat-icon>
            <h2>Codigo expirado</h2>
            <p>{{ error() }}</p>
          } @else if (errorCode() === 'AUTH_TIMEOUT') {
            <mat-icon class="error-icon timeout-icon">wifi_off</mat-icon>
            <h2>Error de conexion</h2>
            <p>{{ error() }}</p>
          } @else {
            <mat-icon class="error-icon">error_outline</mat-icon>
            <h2>Error de autenticacion</h2>
            <p>{{ error() }}</p>
          }
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
      text-align: center; max-width: 440px; padding: 0 24px;
    }
    .error-icon { font-size: 48px; width: 48px; height: 48px; color: #f44336; }
    .domain-icon { color: #f59e0b !important; }
    .email-icon { color: #3b82f6 !important; }
    .pending-icon { color: #f59e0b !important; }
    .timeout-icon { color: #f59e0b !important; }
    .callback-error h2 { margin: 0; }
    .callback-error p { color: rgba(255,255,255,0.5); margin: 0 0 16px; }
    .domain-error-detail {
      color: rgba(255,255,255,0.7) !important;
      font-size: 1.05rem; font-weight: 500;
    }
    .domain-error-hint {
      font-size: 0.85rem; line-height: 1.6;
      color: rgba(255,255,255,0.4) !important;
    }
    .pending-user-info {
      display: flex; flex-direction: column; gap: 4px;
      background: rgba(255,255,255,0.06); border-radius: 8px;
      padding: 12px 20px; margin: 4px 0;
    }
    .pending-user-label {
      font-size: 0.9rem; color: rgba(255,255,255,0.5);
    }
    .pending-user-label strong {
      color: rgba(255,255,255,0.85);
    }
  `],
})
export class OAuthCallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly error = signal('');
  readonly errorCode = signal('');
  readonly errorUsername = signal('');
  readonly errorEmail = signal('');

  ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('code');
    const state = this.route.snapshot.queryParamMap.get('state');
    const errorParam = this.route.snapshot.queryParamMap.get('error');

    if (errorParam) {
      this.error.set(this.route.snapshot.queryParamMap.get('error_description') || 'Autenticacion cancelada');
      return;
    }

    if (!code || !state) {
      this.error.set('Parametros de autenticacion incompletos');
      return;
    }

    this.authService.handleOAuthCallback(code, state).subscribe({
      next: () => this.router.navigateByUrl('/home'),
      error: (err) => {
        this.errorCode.set(err?.error?.errorCode || '');
        this.error.set(err?.error?.message || err?.message || 'Error al autenticar con GitHub');
        this.errorUsername.set(err?.error?.username || '');
        this.errorEmail.set(err?.error?.email || '');
      },
    });
  }

  goToLogin(): void {
    this.router.navigate(['/']);
  }
}
