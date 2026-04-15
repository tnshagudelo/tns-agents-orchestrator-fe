import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from './config.service';
import { environment } from '../../../../environments/environment';

describe('ConfigService', () => {
  let svc: ConfigService;
  let httpMock: HttpTestingController;
  const url = (p: string) => `${environment.apiUrl}${p}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConfigService, provideHttpClient(), provideHttpClientTesting()],
    });
    svc = TestBed.inject(ConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loadSearchProviders stores result', async () => {
    const p = firstValueFrom(svc.loadSearchProviders());
    httpMock.expectOne(url('/api/config/search-providers')).flush([{ name: 'google' }]);
    await p;
    expect(svc.searchProviders()).toHaveLength(1);
  });

  it('updateSearchProvider triggers a reload', async () => {
    const p = firstValueFrom(svc.updateSearchProvider('google', { enabled: true }));
    httpMock.expectOne(url('/api/config/search-providers/google')).flush({});
    await p;
    httpMock.expectOne(url('/api/config/search-providers')).flush([]);
  });

  it('testSearchProvider posts and returns result', async () => {
    const p = firstValueFrom(svc.testSearchProvider('google'));
    httpMock.expectOne(url('/api/config/search-providers/google/test'))
      .flush({ success: true, message: 'ok', responseTimeMs: 50 });
    const r = await p;
    expect(r.success).toBe(true);
  });

  it('loadLlmConfig stores config', async () => {
    const p = firstValueFrom(svc.loadLlmConfig());
    httpMock.expectOne(url('/api/config/llm'))
      .flush({ activeProvider: 'openai', activeModel: 'gpt-4', availableProviders: [] });
    await p;
    expect(svc.llmConfig()?.activeProvider).toBe('openai');
  });

  it('setLlmProvider triggers a reload of llm config', async () => {
    const p = firstValueFrom(svc.setLlmProvider('openai', 'gpt-4'));
    httpMock.expectOne(url('/api/config/llm')).flush({});
    await p;
    httpMock.expectOne(url('/api/config/llm'))
      .flush({ activeProvider: 'openai', activeModel: 'gpt-4', availableProviders: [] });
  });

  it('testLlm posts to /llm/test', async () => {
    const p = firstValueFrom(svc.testLlm());
    httpMock.expectOne(url('/api/config/llm/test'))
      .flush({ success: true, message: 'ok', responseTimeMs: 10 });
    const r = await p;
    expect(r.success).toBe(true);
  });

  it('loadUsage stores result', async () => {
    const p = firstValueFrom(svc.loadUsage());
    httpMock.expectOne(url('/api/config/usage')).flush({
      llm: { provider: 'openai', inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0 },
      search: [],
    });
    await p;
    expect(svc.usage()?.llm.provider).toBe('openai');
  });
});
