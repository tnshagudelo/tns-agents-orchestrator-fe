import { Injectable, signal, computed } from '@angular/core';
import { AuthState, LoginRequest, User } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _state = signal<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });

  readonly state = this._state.asReadonly();
  readonly isAuthenticated = computed(() => this._state().isAuthenticated);
  readonly currentUser = computed(() => this._state().user);

  login(credentials: LoginRequest): void {
    this._state.update(s => ({ ...s, isLoading: true }));
    // Replace with actual HTTP call via AuthApiService
    const mockUser: User = {
      id: '1',
      username: credentials.username,
      email: `${credentials.username}@example.com`,
      roles: ['user'],
      token: 'mock-jwt-token',
    };
    localStorage.setItem('auth_token', mockUser.token!);
    this._state.set({ user: mockUser, isAuthenticated: true, isLoading: false });
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this._state.set({ user: null, isAuthenticated: false, isLoading: false });
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  restoreSession(): void {
    const token = this.getToken();
    if (token) {
      // In production, validate the token via an API call
      this._state.update(s => ({ ...s, isAuthenticated: true }));
    }
  }
}
