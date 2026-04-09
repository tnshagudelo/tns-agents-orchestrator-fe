import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
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

  /** Login directo con un objeto User (para mock users) */
  loginWithUser(user: User): Observable<User> {
    this._state.update(s => ({ ...s, isLoading: true }));
    const token = `mock-jwt-${user.id}-${Date.now()}`;
    const userWithToken = { ...user, token };
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userWithToken));
    this._state.set({ user: userWithToken, isAuthenticated: true, isLoading: false });
    return of(userWithToken);
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
      try {
        const user: User = JSON.parse(raw);
        this._state.set({ user, isAuthenticated: true, isLoading: false });
      } catch {
        this.logout();
      }
    }
  }
}
