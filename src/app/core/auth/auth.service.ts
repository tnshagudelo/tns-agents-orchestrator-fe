import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthState, User, ProposalRoleType, OAuthCallbackResponse } from '../../shared/models';
import { environment } from '../../../environments/environment';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';
const GITHUB_TOKEN_KEY = 'github_access_token';
const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  private readonly _state = signal<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });

  readonly state = this._state.asReadonly();
  readonly isAuthenticated = computed(() => this._state().isAuthenticated);
  readonly currentUser = computed(() => this._state().user);

  /** Redirige al flujo OAuth de GitHub */
  loginWithGitHub(): void {
    const { clientId, redirectUri, scope } = environment.githubOAuth;
    const state = crypto.randomUUID();
    sessionStorage.setItem('oauth_state', state);
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope,
      state,
    });
    window.location.href = `${GITHUB_AUTH_URL}?${params.toString()}`;
  }

  /** Intercambia el code de GitHub por un JWT via backend */
  handleOAuthCallback(code: string, state: string): Observable<User> {
    const savedState = sessionStorage.getItem('oauth_state');
    if (savedState && savedState !== state) {
      return new Observable(subscriber => {
        subscriber.error(new Error('OAuth state mismatch'));
      });
    }
    sessionStorage.removeItem('oauth_state');

    this._state.update(s => ({ ...s, isLoading: true }));

    return new Observable(subscriber => {
      this.http
        .post<OAuthCallbackResponse>(`${environment.apiUrl}/api/auth/github/callback`, { code })
        .subscribe({
          next: (res) => {
            const user: User = {
              id: res.user.id,
              username: res.user.username,
              email: res.user.email,
              avatarUrl: res.user.avatarUrl,
              roles: ['builder'],
              proposalRole: 'builder',
              authProvider: 'github',
              token: res.token,
            };
            localStorage.setItem(AUTH_TOKEN_KEY, res.token);
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
            if (res.githubAccessToken) {
              localStorage.setItem(GITHUB_TOKEN_KEY, res.githubAccessToken);
            }
            this._state.set({ user, isAuthenticated: true, isLoading: false });
            subscriber.next(user);
            subscriber.complete();
          },
          error: (err) => {
            this._state.update(s => ({ ...s, isLoading: false }));
            subscriber.error(err);
          },
        });
    });
  }

  /** Cambia el rol de propuesta del usuario actual (dev tool) */
  switchProposalRole(role: ProposalRoleType): void {
    const user = this._state().user;
    if (!user) return;
    const updated: User = { ...user, proposalRole: role, roles: [role] };
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
    this._state.set({ user: updated, isAuthenticated: true, isLoading: false });
  }

  logout(): void {
    const githubToken = localStorage.getItem(GITHUB_TOKEN_KEY);
    if (githubToken) {
      this.http
        .post(`${environment.apiUrl}/api/auth/logout`, { githubAccessToken: githubToken })
        .subscribe({ error: () => { /* best-effort revocation */ } });
    }

    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(GITHUB_TOKEN_KEY);
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
