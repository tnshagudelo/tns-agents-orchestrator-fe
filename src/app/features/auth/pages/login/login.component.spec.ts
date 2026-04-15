import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../../core/auth/auth.service';

describe('LoginComponent', () => {
  let router: { navigateByUrl: ReturnType<typeof vi.fn> };
  let auth: { loginWithUser: ReturnType<typeof vi.fn> };
  let queryReturnUrl: string | null;

  beforeEach(() => {
    router = { navigateByUrl: vi.fn() };
    auth = { loginWithUser: vi.fn().mockReturnValue(of({ id: '1' })) };
    queryReturnUrl = null;
    TestBed.configureTestingModule({
      imports: [LoginComponent, NoopAnimationsModule],
      providers: [
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: auth },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => queryReturnUrl } } } },
      ],
    });
  });

  it('renders mock users', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.users.length).toBeGreaterThan(0);
  });

  it('loginAs logs in and redirects to /home when no returnUrl', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const mock = fixture.componentInstance.users[0];
    fixture.componentInstance.loginAs(mock);
    expect(auth.loginWithUser).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/home');
  });

  it('loginAs redirects to returnUrl when present', () => {
    queryReturnUrl = '/proposals';
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.componentInstance.loginAs(fixture.componentInstance.users[0]);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/proposals');
  });
});
