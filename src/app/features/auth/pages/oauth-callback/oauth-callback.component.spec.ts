import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { OAuthCallbackComponent } from './oauth-callback.component';
import { AuthService } from '../../../../core/auth/auth.service';

describe('OAuthCallbackComponent', () => {
  let httpMock: HttpTestingController;
  let router: Router;
  let authService: { handleOAuthCallback: ReturnType<typeof vi.fn> };

  const buildRoute = (queryParams: Record<string, string>) => ({
    snapshot: {
      queryParamMap: {
        get: (key: string) => queryParams[key] ?? null,
      },
    },
  });

  const setup = (queryParams: Record<string, string> = { code: 'abc', state: 'xyz' }) => {
    authService = { handleOAuthCallback: vi.fn().mockReturnValue(of({})) };
    TestBed.configureTestingModule({
      imports: [OAuthCallbackComponent, NoopAnimationsModule],
      providers: [
        provideRouter([{ path: 'home', component: OAuthCallbackComponent }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: buildRoute(queryParams) },
        { provide: AuthService, useValue: authService },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl');
    vi.spyOn(router, 'navigate');
  };

  afterEach(() => httpMock.verify());

  it('sets error when error query param is present', () => {
    setup({ error: 'access_denied', error_description: 'User denied' });
    const fixture = TestBed.createComponent(OAuthCallbackComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.error()).toBe('User denied');
    expect(authService.handleOAuthCallback).not.toHaveBeenCalled();
  });

  it('sets error when error param without description', () => {
    setup({ error: 'access_denied' });
    const fixture = TestBed.createComponent(OAuthCallbackComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.error()).toBe('Autenticacion cancelada');
  });

  it('sets error when code or state is missing', () => {
    setup({});
    const fixture = TestBed.createComponent(OAuthCallbackComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.error()).toBe('Parametros de autenticacion incompletos');
  });

  it('calls handleOAuthCallback and navigates to /home on success', () => {
    setup({ code: 'abc', state: 'xyz' });
    const fixture = TestBed.createComponent(OAuthCallbackComponent);
    fixture.detectChanges();
    expect(authService.handleOAuthCallback).toHaveBeenCalledWith('abc', 'xyz');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/home');
  });

  it('sets errorCode on PENDING_APPROVAL error', () => {
    setup({ code: 'abc', state: 'xyz' });
    authService.handleOAuthCallback.mockReturnValue(
      throwError(() => ({
        error: { errorCode: 'PENDING_APPROVAL', message: 'Pendiente', username: 'user1', email: 'u@e.com' },
      }))
    );
    const fixture = TestBed.createComponent(OAuthCallbackComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.errorCode()).toBe('PENDING_APPROVAL');
    expect(fixture.componentInstance.error()).toBe('Pendiente');
    expect(fixture.componentInstance.errorUsername()).toBe('user1');
    expect(fixture.componentInstance.errorEmail()).toBe('u@e.com');
  });

  it('sets errorCode on USER_REJECTED error', () => {
    setup({ code: 'abc', state: 'xyz' });
    authService.handleOAuthCallback.mockReturnValue(
      throwError(() => ({
        error: { errorCode: 'USER_REJECTED', message: 'Rechazado' },
      }))
    );
    const fixture = TestBed.createComponent(OAuthCallbackComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.errorCode()).toBe('USER_REJECTED');
    expect(fixture.componentInstance.error()).toBe('Rechazado');
  });

  it('sets errorCode on USER_INACTIVE error', () => {
    setup({ code: 'abc', state: 'xyz' });
    authService.handleOAuthCallback.mockReturnValue(
      throwError(() => ({
        error: { errorCode: 'USER_INACTIVE', message: 'Desactivado' },
      }))
    );
    const fixture = TestBed.createComponent(OAuthCallbackComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.errorCode()).toBe('USER_INACTIVE');
    expect(fixture.componentInstance.error()).toBe('Desactivado');
  });

  it('handles generic error without errorCode', () => {
    setup({ code: 'abc', state: 'xyz' });
    authService.handleOAuthCallback.mockReturnValue(
      throwError(() => ({ message: 'Network error' }))
    );
    const fixture = TestBed.createComponent(OAuthCallbackComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.errorCode()).toBe('');
    expect(fixture.componentInstance.error()).toBe('Network error');
  });

  it('goToLogin navigates to root', () => {
    setup({ code: 'abc', state: 'xyz' });
    const fixture = TestBed.createComponent(OAuthCallbackComponent);
    fixture.detectChanges();
    fixture.componentInstance.goToLogin();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
