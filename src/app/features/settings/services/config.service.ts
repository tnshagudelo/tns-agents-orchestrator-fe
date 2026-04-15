import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { BaseApiService } from '../../../core/services/base-api.service';

export interface SearchProviderConfig {
  name: string;
  enabled: boolean;
  priority: number;
  available: boolean;
  status: string;
  dependsOn: string;
  lastUsed?: string;
  callsThisMonth: number;
  monthlyLimit?: number;
}

export interface LlmConfig {
  activeProvider: string;
  activeModel: string;
  availableProviders: LlmProviderInfo[];
}

export interface LlmProviderInfo {
  name: string;
  configured: boolean;
  models: string[];
}

export interface UsageInfo {
  llm: { provider: string; inputTokens: number; outputTokens: number; estimatedCostUsd: number };
  search: { name: string; callsThisMonth: number; limit?: number; remaining?: number }[];
}

export interface TestResult {
  success: boolean;
  message: string;
  responseTimeMs: number;
}

@Injectable({ providedIn: 'root' })
export class ConfigService extends BaseApiService {
  private readonly _searchProviders = signal<SearchProviderConfig[]>([]);
  private readonly _llmConfig = signal<LlmConfig | null>(null);
  private readonly _usage = signal<UsageInfo | null>(null);

  readonly searchProviders = this._searchProviders.asReadonly();
  readonly llmConfig = this._llmConfig.asReadonly();
  readonly usage = this._usage.asReadonly();

  constructor(http: HttpClient) { super(http); }

  loadSearchProviders(): Observable<SearchProviderConfig[]> {
    return this.get<SearchProviderConfig[]>('/api/config/search-providers').pipe(
      tap(providers => this._searchProviders.set(providers))
    );
  }

  updateSearchProvider(name: string, update: { enabled?: boolean; priority?: number; apiKey?: string }): Observable<unknown> {
    return this.put(`/api/config/search-providers/${name}`, update).pipe(
      tap(() => this.loadSearchProviders().subscribe())
    );
  }

  testSearchProvider(name: string): Observable<TestResult> {
    return this.post<TestResult>(`/api/config/search-providers/${name}/test`, {});
  }

  testLlm(): Observable<TestResult> {
    return this.post<TestResult>('/api/config/llm/test', {});
  }

  loadLlmConfig(): Observable<LlmConfig> {
    return this.get<LlmConfig>('/api/config/llm').pipe(
      tap(config => this._llmConfig.set(config))
    );
  }

  setLlmProvider(provider: string, model: string): Observable<unknown> {
    return this.put('/api/config/llm', { provider, model }).pipe(
      tap(() => this.loadLlmConfig().subscribe())
    );
  }

  loadUsage(): Observable<UsageInfo> {
    return this.get<UsageInfo>('/api/config/usage').pipe(
      tap(usage => this._usage.set(usage))
    );
  }
}
