import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../auth/auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let auth: { getToken: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    auth = { getToken: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('adds Bearer Authorization header when token present', async () => {
    auth.getToken.mockReturnValue('abc123');
    const p = firstValueFrom(http.get('/x'));
    const req = httpMock.expectOne('/x');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc123');
    req.flush({});
    await p;
  });

  it('does not add header when token missing', async () => {
    auth.getToken.mockReturnValue(null);
    const p = firstValueFrom(http.get('/x'));
    const req = httpMock.expectOne('/x');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
    await p;
  });
});
