import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { SettingsPageComponent } from './settings-page.component';

describe('SettingsPageComponent', () => {
  let httpMock: HttpTestingController;

  const flushInit = () => {
    httpMock.expectOne(r => r.url.endsWith('/api/config/search-providers')).flush([
      { name: 'google', enabled: true, priority: 1, available: true, status: 'active', dependsOn: '', callsThisMonth: 5 },
    ]);
    httpMock.expectOne(r => r.url.endsWith('/api/config/llm')).flush({
      activeProvider: 'openai',
      activeModel: 'gpt-4',
      availableProviders: [{ name: 'openai', configured: true, models: ['gpt-4', 'gpt-3.5'] }],
    });
    httpMock.expectOne(r => r.url.endsWith('/api/config/usage')).flush({
      llm: { provider: 'openai', inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0 },
      search: [],
    });
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SettingsPageComponent, NoopAnimationsModule],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads providers/llm/usage on init', () => {
    const fixture = TestBed.createComponent(SettingsPageComponent);
    fixture.detectChanges();
    flushInit();
    expect(fixture.componentInstance.selectedLlmProvider).toBe('openai');
    expect(fixture.componentInstance.selectedLlmModel).toBe('gpt-4');
  });

  it('toggleProvider hits PUT and triggers reload', () => {
    const fixture = TestBed.createComponent(SettingsPageComponent);
    fixture.detectChanges();
    flushInit();
    const provider = fixture.componentInstance.searchProviders()[0];
    fixture.componentInstance.toggleProvider(provider);
    httpMock.expectOne(r => r.url.endsWith('/api/config/search-providers/google')).flush({});
    httpMock.expectOne(r => r.url.endsWith('/api/config/search-providers')).flush([]);
  });

  it('saveApiKey ignores empty input and sends PUT when set', () => {
    const fixture = TestBed.createComponent(SettingsPageComponent);
    fixture.detectChanges();
    flushInit();
    fixture.componentInstance.saveApiKey('google');
    fixture.componentInstance.apiKeys['google'] = 'KEY';
    fixture.componentInstance.saveApiKey('google');
    httpMock.expectOne(r => r.url.endsWith('/api/config/search-providers/google')).flush({});
    httpMock.expectOne(r => r.url.endsWith('/api/config/search-providers')).flush([]);
    expect(fixture.componentInstance.apiKeys['google']).toBe('');
  });

  it('testProvider records result and reloads', () => {
    const fixture = TestBed.createComponent(SettingsPageComponent);
    fixture.detectChanges();
    flushInit();
    fixture.componentInstance.testProvider('google');
    expect(fixture.componentInstance.testing['google']).toBe(true);
    httpMock.expectOne(r => r.url.endsWith('/api/config/search-providers/google/test')).flush({
      success: true, message: 'ok', responseTimeMs: 10,
    });
    httpMock.expectOne(r => r.url.endsWith('/api/config/usage')).flush({
      llm: { provider: 'openai', inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0 }, search: [],
    });
    httpMock.expectOne(r => r.url.endsWith('/api/config/search-providers')).flush([]);
    expect(fixture.componentInstance.testResults['google']?.success).toBe(true);
    expect(fixture.componentInstance.testing['google']).toBe(false);
  });

  it('testProvider records error result', () => {
    const fixture = TestBed.createComponent(SettingsPageComponent);
    fixture.detectChanges();
    flushInit();
    fixture.componentInstance.testProvider('google');
    httpMock.expectOne(r => r.url.endsWith('/api/config/search-providers/google/test'))
      .error(new ProgressEvent('err'));
    expect(fixture.componentInstance.testResults['google']?.success).toBe(false);
  });

  it('switchLlm PUTs and reloads providers', () => {
    const fixture = TestBed.createComponent(SettingsPageComponent);
    fixture.detectChanges();
    flushInit();
    fixture.componentInstance.switchLlm();
    httpMock.expectOne(r => r.url.endsWith('/api/config/llm')).flush({});
    httpMock.expectOne(r => r.url.endsWith('/api/config/llm')).flush({
      activeProvider: 'openai', activeModel: 'gpt-4', availableProviders: [],
    });
    httpMock.expectOne(r => r.url.endsWith('/api/config/search-providers')).flush([]);
  });

  it('switchLlm no-op when provider/model empty', () => {
    const fixture = TestBed.createComponent(SettingsPageComponent);
    fixture.detectChanges();
    flushInit();
    fixture.componentInstance.selectedLlmProvider = '';
    fixture.componentInstance.switchLlm();
    httpMock.verify();
  });

  it('testLlm success and error paths', () => {
    const fixture = TestBed.createComponent(SettingsPageComponent);
    fixture.detectChanges();
    flushInit();
    fixture.componentInstance.testLlm();
    httpMock.expectOne(r => r.url.endsWith('/api/config/llm/test'))
      .flush({ success: true, message: 'ok', responseTimeMs: 10 });
    httpMock.expectOne(r => r.url.endsWith('/api/config/usage')).flush({
      llm: { provider: 'openai', inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0 }, search: [],
    });
    expect(fixture.componentInstance.llmTestResult?.success).toBe(true);

    fixture.componentInstance.testLlm();
    httpMock.expectOne(r => r.url.endsWith('/api/config/llm/test')).error(new ProgressEvent('err'));
    expect(fixture.componentInstance.llmTestResult?.success).toBe(false);
  });

  it('onProviderChange picks first model of provider', () => {
    const fixture = TestBed.createComponent(SettingsPageComponent);
    fixture.detectChanges();
    flushInit();
    fixture.componentInstance.selectedLlmProvider = 'openai';
    fixture.componentInstance.selectedLlmModel = '';
    fixture.componentInstance.onProviderChange();
    expect(fixture.componentInstance.selectedLlmModel).toBe('gpt-4');
  });

  it('getStatusColor/getStatusIcon handle known and default', () => {
    const fixture = TestBed.createComponent(SettingsPageComponent);
    fixture.detectChanges();
    flushInit();
    expect(fixture.componentInstance.getStatusColor('active')).toBe('#059669');
    expect(fixture.componentInstance.getStatusColor('error')).toBe('#dc2626');
    expect(fixture.componentInstance.getStatusColor('disabled')).toBe('#999');
    expect(fixture.componentInstance.getStatusColor('other')).toBe('#d97706');
    expect(fixture.componentInstance.getStatusIcon('active')).toBe('check_circle');
    expect(fixture.componentInstance.getStatusIcon('other')).toBe('help');
  });

  it('getUsagePercent clamps', () => {
    const fixture = TestBed.createComponent(SettingsPageComponent);
    fixture.detectChanges();
    flushInit();
    expect(fixture.componentInstance.getUsagePercent(5, 10)).toBe(50);
    expect(fixture.componentInstance.getUsagePercent(20, 10)).toBe(100);
    expect(fixture.componentInstance.getUsagePercent(5)).toBe(0);
  });
});
