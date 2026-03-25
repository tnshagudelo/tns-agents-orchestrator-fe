import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/auth/auth.service';
import { User } from '../../../../shared/models';
import { MOCK_USERS, MockUser } from '../../../proposals/models/mock-users.const';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <div class="login-container">
      <div class="login-content">
        <div class="login-header">
          <img src="tns-logo.svg?v=2" alt="TNS Agents" class="login-logo" />
          <p>Selecciona tu perfil para continuar</p>
        </div>

        <div class="user-cards">
          @for (user of users; track user.id) {
            <button class="user-card" (click)="loginAs(user)">
              <div class="user-avatar" [class]="'avatar-' + user.proposalRole">
                <mat-icon>{{ user.icon }}</mat-icon>
              </div>
              <div class="user-info">
                <span class="user-name">{{ user.name }}</span>
                <span class="user-role">{{ user.roleLabel }}</span>
              </div>
              <mat-icon class="arrow">arrow_forward</mat-icon>
            </button>
          }
        </div>

        <p class="login-hint">Ambiente de desarrollo — autenticación simulada</p>
      </div>
    </div>
  `,
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

    .user-cards { display: flex; flex-direction: column; gap: 12px; width: 100%; }

    .user-card {
      display: flex; align-items: center; gap: 16px;
      padding: 16px 20px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.06); backdrop-filter: blur(8px);
      cursor: pointer; transition: all 0.2s; width: 100%; text-align: left;
      color: white;

      &:hover {
        background: rgba(255,255,255,0.12);
        border-color: rgba(218,108,207,0.4);
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      }
    }

    .user-avatar {
      width: 48px; height: 48px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      mat-icon { font-size: 1.5rem; width: 1.5rem; height: 1.5rem; }

      &.avatar-builder  { background: rgba(218,108,207,0.2); color: #da6ccf; }
      &.avatar-reviewer { background: rgba(186,117,23,0.2);  color: #f0b429; }
      &.avatar-approver { background: rgba(59,109,17,0.2);   color: #6dd400; }
    }

    .user-info {
      display: flex; flex-direction: column; flex: 1; gap: 2px;
    }
    .user-name { font-size: 1rem; font-weight: 600; }
    .user-role { font-size: 0.78rem; color: rgba(255,255,255,0.5); }

    .arrow { color: rgba(255,255,255,0.3); transition: color 0.2s; }
    .user-card:hover .arrow { color: #da6ccf; }

    .login-hint {
      font-size: 0.72rem; color: rgba(255,255,255,0.3); margin: 0;
    }
  `],
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly users = MOCK_USERS;

  loginAs(mockUser: MockUser): void {
    const user: User = {
      id: mockUser.id,
      username: mockUser.name,
      email: mockUser.email,
      roles: [mockUser.proposalRole],
      proposalRole: mockUser.proposalRole,
    };
    this.authService.loginWithUser(user).subscribe({
      next: () => this.router.navigate(['/dashboard']),
    });
  }
}
