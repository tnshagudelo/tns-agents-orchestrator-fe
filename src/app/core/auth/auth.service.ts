import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthState, User } from '../../shared/models';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);

  private readonly _state = signal<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });

  readonly state = this._state.asReadonly();
  readonly isAuthenticated = computed(() => this._state().isAuthenticated);
  readonly currentUser = computed(() => this._state().user);

  /** Inicia sesión con un JWT real emitido por el backend tras GitHub OAuth */
  loginWithToken(token: string): void {
    const claims = this.decodeToken(token);
    if (!claims || this.isTokenExpired(token)) {
      this.logout();
      return;
    }
    const user: User = {
      id: String(claims['sub'] ?? ''),
      username: String(claims['github_login'] ?? claims['sub'] ?? ''),
      email: String(claims['email'] ?? ''),
      roles: [],
      proposalRole: 'builder',
      token,
    };
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    this._state.set({ user, isAuthenticated: true, isLoading: false });
  }

  logout(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    this._state.set({ user: null, isAuthenticated: false, isLoading: false });
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  restoreSession(): void {
    const token = this.getToken();
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (token && raw) {
      if (this.isTokenExpired(token)) {
        this.logout();
        return;
      }
      try {
        const user: User = JSON.parse(raw);
        this._state.set({ user, isAuthenticated: true, isLoading: false });
      } catch {
        this.logout();
      }
    }
  }

  isTokenExpired(token: string): boolean {
    const claims = this.decodeToken(token);
    if (!claims || typeof claims['exp'] !== 'number') return true;
    return Date.now() / 1000 > (claims['exp'] as number);
  }

  private decodeToken(token: string): Record<string, unknown> | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) return null;
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}
