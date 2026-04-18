import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, map, switchMap, timeout } from 'rxjs/operators';
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.http
      .post<any>(`${environment.apiUrl}/api/auth/github/callback`, { code })
      .pipe(
        timeout(15_000),
        switchMap((res) => {
          // 2xx without token = pending approval / rejection (backend returns 202)
          if (res.errorCode) {
            return throwError(() => ({ error: res, status: 202 }));
          }

          const user: User = {
            id: res.user.id,
            username: res.user.username,
            email: res.user.email,
            avatarUrl: res.user.avatarUrl,
            roles: ['builder'],
            proposalRole: 'builder',
            authProvider: 'github',
            token: res.token,
            groupId: res.user.groupId,
            groupName: res.user.groupName,
            modules: res.user.modules ?? [],
          };
          localStorage.setItem(AUTH_TOKEN_KEY, res.token);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
          if (res.githubAccessToken) {
            localStorage.setItem(GITHUB_TOKEN_KEY, res.githubAccessToken);
          }
          this._state.set({ user, isAuthenticated: true, isLoading: false });
          return [user] as const;
        }),
        catchError((err) => {
          // Timeout or network failure
          if (err?.name === 'TimeoutError' || err?.status === 0) {
            return throwError(() => ({
              error: {
                message: 'No se pudo conectar con el servidor de autenticacion. Verifica tu conexion e intenta de nuevo.',
                errorCode: 'AUTH_TIMEOUT',
              },
              status: 0,
            }));
          }

          // Normalize: HttpErrorResponse has err.error, our thrown objects already have it
          const error = err?.error ?? {};
          return throwError(() => ({ error, status: err?.status ?? 0 }));
        }),
        finalize(() => {
          this._state.update(s => ({ ...s, isLoading: false }));
        }),
      );
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
    this.router.navigate(['/']);
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
