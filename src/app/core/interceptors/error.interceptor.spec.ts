import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { errorInterceptor } from './error.interceptor';
import { AuthService } from '../auth/auth.service';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let router: { navigate: ReturnType<typeof vi.fn> };
  let auth: { logout: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    router = { navigate: vi.fn() };
    auth = { logout: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: auth },
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  const trigger = async (status: number) => {
    const p = firstValueFrom(http.get('/x')).catch(e => e);
    const req = httpMock.expectOne('/x');
    req.flush({ msg: 'err' }, { status, statusText: 'err' });
    return p;
  };

  it('401 calls authService.logout and navigates to /auth/login', async () => {
    await trigger(401);
    expect(auth.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('403 navigates to /forbidden', async () => {
    await trigger(403);
    expect(router.navigate).toHaveBeenCalledWith(['/forbidden']);
    expect(auth.logout).not.toHaveBeenCalled();
  });

  it('other errors propagate without side effects', async () => {
    const err = await trigger(500);
    expect(err).toBeTruthy();
    expect(auth.logout).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('successful requests pass through', async () => {
    const p = firstValueFrom(http.get<{ ok: true }>('/ok'));
    httpMock.expectOne('/ok').flush({ ok: true });
    expect(await p).toEqual({ ok: true });
  });
});
