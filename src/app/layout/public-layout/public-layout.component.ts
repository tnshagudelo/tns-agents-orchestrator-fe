import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, MatButtonModule, MatIconModule],
  template: `
    <div class="public-layout">
      <header class="public-header">
        <div class="header-left">
          <img src="tns-logo.svg?v=2" alt="TNS Agents" class="header-logo" />
        </div>
        <div class="header-right">
          @if (authService.isAuthenticated()) {
            <button mat-stroked-button (click)="goToApp()">
              <mat-icon>arrow_back</mat-icon> Volver a la app
            </button>
          } @else {
            <button mat-flat-button color="primary" (click)="goToLogin()">
              <mat-icon>login</mat-icon> Iniciar sesion
            </button>
          }
        </div>
      </header>
      <main class="public-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .public-layout {
      min-height: 100vh;
      background: #f8f9fa;
    }
    .public-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 24px;
      background: linear-gradient(135deg, #0d0d1a, #1a1a2e);
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .header-logo {
      height: 40px; border-radius: 8px;
    }
    .header-right button {
      font-size: 13px;
    }
    .public-content {
      max-width: 1200px; margin: 0 auto;
    }
  `],
})
export class PublicLayoutComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  goToApp(): void {
    this.router.navigate(['/home']);
  }
}
