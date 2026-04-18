import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ConfigService, SearchProviderConfig, TestResult } from '../../services/config.service';
import { AllowedDomainService } from '../../services/allowed-domain.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    FormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatSlideToggleModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatRadioModule, MatProgressBarModule,
    MatTooltipModule, MatDividerModule,
  ],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss',
})
export class SettingsPageComponent implements OnInit {
  private readonly configService = inject(ConfigService);
  private readonly domainService = inject(AllowedDomainService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly searchProviders = this.configService.searchProviders;
  readonly llmConfig = this.configService.llmConfig;
  readonly usage = this.configService.usage;
  readonly allowedDomains = this.domainService.domains;

  apiKeys: Record<string, string> = {};
  testResults: Record<string, TestResult | null> = {};
  testing: Record<string, boolean> = {};
  selectedLlmProvider = '';
  selectedLlmModel = '';

  // Allowed domains
  newDomain = '';
  newDomainDescription = '';

  ngOnInit(): void {
    this.configService.loadSearchProviders().subscribe();
    this.configService.loadLlmConfig().subscribe(config => {
      this.selectedLlmProvider = config.activeProvider;
      this.selectedLlmModel = config.activeModel;
    });
    this.configService.loadUsage().subscribe();
    this.domainService.loadDomains().subscribe();
  }

  toggleProvider(provider: SearchProviderConfig): void {
    this.configService.updateSearchProvider(provider.name, { enabled: !provider.enabled }).subscribe();
  }

  saveApiKey(name: string): void {
    const key = this.apiKeys[name];
    if (!key?.trim()) return;
    this.configService.updateSearchProvider(name, { apiKey: key }).subscribe(() => {
      this.apiKeys[name] = '';
    });
  }

  testProvider(name: string): void {
    this.testing[name] = true;
    this.testResults[name] = null;
    this.configService.testSearchProvider(name).subscribe({
      next: (result) => {
        this.testResults[name] = result;
        this.testing[name] = false;
        this.configService.loadUsage().subscribe();
        this.configService.loadSearchProviders().subscribe();
        this.cdr.markForCheck();
      },
      error: () => {
        this.testResults[name] = { success: false, message: 'Error de conexión', responseTimeMs: 0 };
        this.testing[name] = false;
        this.cdr.markForCheck();
      },
    });
  }

  switchLlm(): void {
    if (!this.selectedLlmProvider || !this.selectedLlmModel) return;
    this.configService.setLlmProvider(this.selectedLlmProvider, this.selectedLlmModel).subscribe(() => {
      // Reload search providers since availability depends on active LLM
      this.configService.loadSearchProviders().subscribe();
    });
  }

  llmTestResult: { success: boolean; message: string; responseTimeMs: number } | null = null;
  llmTesting = false;

  testLlm(): void {
    this.llmTesting = true;
    this.llmTestResult = null;
    this.configService.testLlm().subscribe({
      next: result => { this.llmTestResult = result; this.llmTesting = false; this.configService.loadUsage().subscribe(); },
      error: () => { this.llmTestResult = { success: false, message: 'Error de conexión', responseTimeMs: 0 }; this.llmTesting = false; }
    });
  }

  onProviderChange(): void {
    const provider = this.llmConfig()?.availableProviders.find(p => p.name === this.selectedLlmProvider);
    if (provider?.models.length) this.selectedLlmModel = provider.models[0];
  }

  getStatusColor(status: string): string {
    return ({ active: '#059669', error: '#dc2626', disabled: '#999' })[status] ?? '#d97706';
  }

  getStatusIcon(status: string): string {
    return ({ active: 'check_circle', error: 'error', disabled: 'pause_circle' })[status] ?? 'help';
  }

  getUsagePercent(calls: number, limit?: number): number {
    return limit ? Math.min(100, (calls / limit) * 100) : 0;
  }

  // ── Allowed Domains ──────────────────────────────────────────────────────
  addDomain(): void {
    const domain = this.newDomain.trim().toLowerCase();
    if (!domain) return;
    this.domainService.createDomain({
      domain,
      description: this.newDomainDescription.trim() || undefined,
    }).subscribe(() => {
      this.newDomain = '';
      this.newDomainDescription = '';
      this.cdr.markForCheck();
    });
  }

  toggleDomainActive(d: { id: string; domain: string; description: string | null; isActive: boolean }): void {
    this.domainService.updateDomain(d.id, {
      domain: d.domain,
      description: d.description ?? undefined,
      isActive: !d.isActive,
    }).subscribe();
  }

  removeDomain(id: string): void {
    this.domainService.deleteDomain(id).subscribe();
  }
}
