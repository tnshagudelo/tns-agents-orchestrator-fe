import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../../core/auth/auth.service';

describe('LoginComponent', () => {
  let auth: { loginWithGitHub: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    auth = { loginWithGitHub: vi.fn() };
    TestBed.configureTestingModule({
      imports: [LoginComponent, NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: auth },
      ],
    });
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('loginWithGitHub calls authService.loginWithGitHub', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    fixture.componentInstance.loginWithGitHub();
    expect(auth.loginWithGitHub).toHaveBeenCalled();
  });
});
