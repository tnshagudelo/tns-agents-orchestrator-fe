import { Component, inject } from '@angular/core';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
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

    .github-btn {
      display: flex; align-items: center; justify-content: center; gap: 12px;
      width: 100%; padding: 14px 24px; border-radius: 14px;
      background: white; color: #0d0d1a; border: none;
      font-size: 1rem; font-weight: 600; cursor: pointer;
      transition: all 0.2s;
    }
    .github-btn:hover {
      background: #f0f0f0; transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    }
    .github-icon { flex-shrink: 0; }

  `],
})
export class LoginComponent {
  private readonly authService = inject(AuthService);

  loginWithGitHub(): void {
    this.authService.loginWithGitHub();
  }
}
