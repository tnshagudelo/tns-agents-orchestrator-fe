import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './login.component.html',
  styles: [`
    .login-container {
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh;
      background: linear-gradient(160deg, #0d0d1a 0%, #1a1a2e 40%, #16213e 70%, #0f3460 100%);
    }

    .login-content {
      width: 440px; display: flex; flex-direction: column; align-items: center; gap: 36px;
    }

    .login-header {
      text-align: center; color: white;
      display: flex; flex-direction: column; align-items: center; gap: 16px;
      p { font-size: 0.9rem; color: rgba(255,255,255,0.5); margin: 0; letter-spacing: 0.3px; }
    }

    .login-logo {
      width: 320px; height: auto;
      border-radius: 18px;
      box-shadow:
        0 4px 24px rgba(98, 0, 234, 0.35),
        0 0 60px rgba(98, 0, 234, 0.12);
    }

    .github-button {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 28px; border-radius: 14px;
      border: 1px solid rgba(255,255,255,0.15);
      background: rgba(255,255,255,0.08); backdrop-filter: blur(8px);
      cursor: pointer; transition: all 0.2s;
      color: white; font-size: 1rem; font-weight: 500;
      width: 100%; justify-content: center;

      &:hover {
        background: rgba(255,255,255,0.15);
        border-color: rgba(218,108,207,0.5);
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      }

      mat-icon { font-size: 1.4rem; width: 1.4rem; height: 1.4rem; }
    }

    .login-hint {
      font-size: 0.72rem; color: rgba(255,255,255,0.3); margin: 0;
    }
  `],
})
export class LoginComponent {
  loginWithGitHub(): void {
    window.location.href = `${environment.apiUrl}/api/auth/github/login`;
  }
}
