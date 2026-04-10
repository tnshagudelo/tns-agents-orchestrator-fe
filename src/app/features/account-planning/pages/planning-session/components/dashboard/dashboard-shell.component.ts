import { Component, input, output, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MarkdownComponent } from 'ngx-markdown';
import { RelativeTimePipe } from '../../../../../../shared/pipes/relative-time.pipe';
import {
  Client, ResearchResult, AnalysisResponse, FindingCard, PlanningSession,
  SESSION_STATUS_MAP,
} from '../../../../models/account-planning.model';

const STAKEHOLDER_COLORS: Record<string, string> = {
  'STRATEGIC_DECISOR': '#7c3aed',
  'TECH_DECISOR': '#2563eb',
  'INFLUENCER': '#059669',
  'GATEKEEPER': '#6b7280',
  'FINANCIAL_DECISOR': '#ea580c',
};

const STAKEHOLDER_LABELS: Record<string, string> = {
  'STRATEGIC_DECISOR': 'Decisor estratégico',
  'TECH_DECISOR': 'Decisor técnico',
  'INFLUENCER': 'Influenciador',
  'GATEKEEPER': 'Gatekeeper',
  'FINANCIAL_DECISOR': 'Decisor financiero',
};

const PRIORITY_COLORS: Record<string, string> = {
  'HIGH': '#059669',
  'MEDIUM': '#d97706',
  'LOW': '#6b7280',
};

const HORIZON_LABELS: Record<string, string> = {
  'SHORT_TERM': 'Corto plazo',
  'MEDIUM_TERM': 'Mediano plazo',
  'LONG_TERM': 'Largo plazo',
};

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [
    MatExpansionModule, MatIconModule, MatButtonModule,
    MatTooltipModule, MatChipsModule, MatDividerModule, MatMenuModule,
    MarkdownComponent, RelativeTimePipe,
  ],
  templateUrl: './dashboard-shell.component.html',
  styleUrl: './dashboard-shell.component.scss',
})
export class DashboardShellComponent {
  readonly client = input.required<Client>();
  readonly results = input.required<ResearchResult[]>();
  readonly sessionDate = input<Date | null>(null);

  readonly currentSessionId = input<string>('');
  readonly clientSessions = input<PlanningSession[]>([]);

  readonly defineFocus = output<void>();
  readonly sessionChanged = output<string>();
  readonly newInvestigation = output<void>();

  readonly otherSessions = computed(() => {
    const current = this.currentSessionId();
    return this.clientSessions()
      .filter(s => s.id !== current && ['AwaitingReview', 'AwaitingFocus', 'UnderRevision', 'Approved'].includes(s.status))
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  });

  /** Parsed structured analysis from AnalysisAgent */
  readonly analysis = computed<AnalysisResponse | null>(() => {
    const results = this.results();
    const structured = results.find(r => r.category === 'analysis-structured');
    if (!structured) return null;
    try {
      return JSON.parse(structured.snippet) as AnalysisResponse;
    } catch {
      return null;
    }
  });

  /** Fallback: raw deep research markdown */
  readonly rawResearch = computed(() => {
    return this.results().find(r => r.category === 'deep-research')?.snippet ?? '';
  });

  /** Whether we have structured data or fallback to markdown */
  readonly hasStructuredData = computed(() => this.analysis() !== null);

  readonly activeSectionId = signal<string | null>(null);
  readonly findingsFilter = signal<string>('ALL');

  readonly filteredFindings = computed(() => {
    const a = this.analysis();
    if (!a?.keyFindings) return [];
    const filter = this.findingsFilter();
    if (filter === 'ALL') return a.keyFindings;
    return a.keyFindings.filter(f => f.type === filter);
  });

  readonly findingTypes = computed(() => {
    const a = this.analysis();
    if (!a?.keyFindings) return [];
    const types = new Set(a.keyFindings.map(f => f.type));
    return ['ALL', ...Array.from(types)];
  });

  readonly findingTypeLabels: Record<string, string> = {
    'ALL': 'Todos',
    'NEWS': 'Noticias',
    'FINANCIAL': 'Financiero',
    'TECH': 'Tecnología',
    'STRATEGIC': 'Estrategia',
    'LINKEDIN': 'LinkedIn',
    'MARKET': 'Mercado',
  };

  toggleFindingRelevance(finding: FindingCard): void {
    finding.isRelevant = !(finding.isRelevant ?? true);
  }

  getStakeholderColor(type: string): string {
    return STAKEHOLDER_COLORS[type] ?? '#6b7280';
  }

  getStakeholderLabel(type: string): string {
    return STAKEHOLDER_LABELS[type] ?? type;
  }

  getPriorityColor(priority: string): string {
    return PRIORITY_COLORS[priority] ?? '#6b7280';
  }

  getHorizonLabel(horizon: string): string {
    return HORIZON_LABELS[horizon] ?? horizon;
  }

  getMetricEntries(metrics: Record<string, string> | undefined): { key: string; value: string }[] {
    if (!metrics) return [];
    return Object.entries(metrics).map(([key, value]) => ({ key, value }));
  }

  scrollTo(id: string): void {
    this.activeSectionId.set(id);
    document.getElementById('section-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  getStatusLabel(status: string): string {
    return SESSION_STATUS_MAP[status as keyof typeof SESSION_STATUS_MAP]?.label ?? status;
  }

  copyText(text: string): void {
    navigator.clipboard.writeText(text);
  }

  copyPainValueTable(): void {
    const a = this.analysis();
    if (!a) return;
    const header = 'Dolor\tValor\tServicio T&S';
    const rows = a.painValueServiceMap.map(r => `${r.pain}\t${r.value}\t${r.service}`);
    this.copyText([header, ...rows].join('\n'));
  }
}
