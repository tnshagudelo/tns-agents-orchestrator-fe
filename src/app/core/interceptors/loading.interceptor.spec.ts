import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { LoadingService, loadingInterceptor } from './loading.interceptor';

describe('LoadingService', () => {
  let svc: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [LoadingService] });
    svc = TestBed.inject(LoadingService);
  });

  it('starts not loading', () => {
    expect(svc.isLoading()).toBe(false);
  });

  it('increment sets loading, decrement clears when counter reaches 0', () => {
    svc.increment();
    expect(svc.isLoading()).toBe(true);
    svc.increment();
    expect(svc.isLoading()).toBe(true);
    svc.decrement();
    expect(svc.isLoading()).toBe(true);
    svc.decrement();
    expect(svc.isLoading()).toBe(false);
  });

  it('decrement below zero clamps to 0 without crashing', () => {
    svc.decrement();
    svc.decrement();
    expect(svc.isLoading()).toBe(false);
  });
});

describe('loadingInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let loading: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LoadingService,
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    loading = TestBed.inject(LoadingService);
  });

  afterEach(() => httpMock.verify());

  it('increments on request and decrements on completion', async () => {
    const p = firstValueFrom(http.get('/x'));
    expect(loading.isLoading()).toBe(true);
    const req = httpMock.expectOne('/x');
    req.flush({});
    await p;
    expect(loading.isLoading()).toBe(false);
  });

  it('decrements even when request errors', async () => {
    const p = firstValueFrom(http.get('/fail')).catch(() => undefined);
    const req = httpMock.expectOne('/fail');
    req.error(new ProgressEvent('error'));
    await p;
    expect(loading.isLoading()).toBe(false);
  });
});
