import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, RouterLink],
  template: `
    <div class="landing">
      <div class="hero">
        <div class="hero-glow"></div>
        <div class="hero-content">
          <img src="tns-logo.svg?v=2" alt="TNS Agents" class="hero-logo" />
          <p class="hero-lead">
            Orquestador de agentes inteligentes para potenciar<br />
            los procesos de tu organizacion.
          </p>
          <button class="github-btn" (click)="loginWithGitHub()">
            <svg class="github-icon" viewBox="0 0 24 24" width="22" height="22">
              <path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Iniciar sesion con GitHub
          </button>
          <a class="how-link" routerLink="/public/how-we-work">
            <mat-icon>rocket_launch</mat-icon> Como trabajamos
            <mat-icon class="how-arrow">arrow_forward</mat-icon>
          </a>
        </div>
        <footer class="landing-footer">Tech and Solve &copy; {{ currentYear }}</footer>
      </div>
    </div>
  `,
  styles: [`
    .landing, .hero {
      height: 100vh; overflow: hidden;
    }
    .hero {
      position: relative;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(160deg, #0d0d1a 0%, #1a1a2e 40%, #16213e 70%, #0f3460 100%);
      color: white;
    }
    .hero-glow {
      position: absolute; top: -30%; right: -15%;
      width: 500px; height: 500px; border-radius: 50%;
      background: radial-gradient(circle, rgba(218,108,207,0.2) 0%, transparent 70%);
      pointer-events: none;
    }
    .hero-content {
      position: relative; z-index: 1;
      display: flex; flex-direction: column; align-items: center;
      max-width: 480px; text-align: center; gap: 24px;
    }
    .hero-logo {
      width: 260px; height: auto; border-radius: 16px;
      box-shadow: 0 4px 24px rgba(98,0,234,0.35), 0 0 60px rgba(98,0,234,0.12);
    }
    .hero-lead {
      font-size: 0.92rem; line-height: 1.7;
      color: rgba(255,255,255,0.6); margin: 0;
    }
    .github-btn {
      display: flex; align-items: center; justify-content: center; gap: 10px;
      width: 100%; max-width: 340px;
      padding: 13px 24px; border-radius: 14px;
      background: white; color: #0d0d1a; border: none;
      font-size: 0.95rem; font-weight: 600; cursor: pointer;
      transition: all 0.2s;
    }
    .github-btn:hover {
      background: #f0f0f0; transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    }
    .how-link {
      display: inline-flex; align-items: center; gap: 6px;
      color: rgba(255,255,255,0.45); text-decoration: none;
      font-size: 0.82rem; font-weight: 500;
      transition: color 0.2s;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }
    .how-link:hover { color: rgba(255,255,255,0.8); }
    .how-arrow { font-size: 14px !important; width: 14px !important; height: 14px !important; }
    .landing-footer {
      position: absolute; bottom: 20px; left: 0; right: 0;
      text-align: center; font-size: 0.72rem;
      color: rgba(255,255,255,0.25);
    }

    @media (max-width: 640px) {
      .hero-logo { width: 200px; }
    }
  `],
})
export class LandingComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentYear = new Date().getFullYear();

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
  }

  loginWithGitHub(): void {
    this.authService.loginWithGitHub();
  }
}
