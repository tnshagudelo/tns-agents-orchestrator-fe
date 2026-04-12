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
import { TranslatePipe } from '../../../../../../core/i18n/translate.pipe';
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
    MarkdownComponent, RelativeTimePipe, TranslatePipe,
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

  /** Merge 3 analysis parts from DB into one AnalysisResponse */
  readonly analysis = computed<AnalysisResponse | null>(() => {
    const results = this.results();
    if (results.length === 0) return null;

    // Try 3-part pipeline first (new)
    const part1 = this.parseResult(results, 'analysis-part1');
    const part2 = this.parseResult(results, 'analysis-part2');
    const part3 = this.parseResult(results, 'analysis-part3');

    if (part1 || part2 || part3) {
      return {
        // Part 1: Profile
        clientCard: part1?.clientCard ?? { name: '', industry: '', country: '', estimatedSize: '', summary: '' },
        challenges: part1?.challenges,
        techVision: part1?.techVision,
        purchasingProfile: part1?.purchasingProfile,
        decisionStructure: part1?.decisionStructure ?? { model: '', keyInfluencers: '', approvalProcess: '' },
        internationalAlert: part1?.internationalAlert ?? { isInternational: false, languages: ['es'] },
        // Part 2: Intelligence
        keyFindings: part2?.keyFindings ?? [],
        stakeholders: part2?.stakeholders ?? [],
        swotAnalysis: part2?.swotAnalysis ?? { strengths: [], weaknesses: [], opportunities: [], threats: [] },
        sectorComparison: part2?.sectorComparison ?? { position: '', competitors: [], trends: [], differentiators: [] },
        recentNews: part2?.recentNews ?? [],
        sources: part2?.sources ?? [],
        // Part 3: Strategy
        opportunities: part3?.opportunities ?? [],
        painValueServiceMap: part3?.painValueServiceMap ?? [],
        strategicProposal: part3?.strategicProposal ?? { title: '', summary: '', keyBenefits: [], matchedServices: [] },
        keyQuestions: part3?.keyQuestions ?? [],
        keyMessage: part3?.keyMessage ?? '',
      } as AnalysisResponse;
    }

    // Fallback: try legacy single-JSON format
    const legacy = results.find(r => r.category === 'analysis-structured')
      ?? results.find(r => r.category === 'analysis');
    if (!legacy) return null;
    try {
      return JSON.parse(this.cleanJsonString(legacy.snippet)) as AnalysisResponse;
    } catch {
      return null;
    }
  });

  readonly resultsLoaded = computed(() => this.results().length > 0);

  readonly hasParseError = computed(() => {
    if (!this.resultsLoaded()) return false;
    const hasAny = this.results().some(r =>
      r.category.startsWith('analysis-part') || r.category === 'analysis-structured' || r.category === 'analysis');
    return hasAny && this.analysis() === null;
  });

  readonly hasNoAnalysis = computed(() => {
    if (!this.resultsLoaded()) return false;
    return !this.results().some(r =>
      r.category.startsWith('analysis-part') || r.category === 'analysis-structured' || r.category === 'analysis');
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private parseResult(results: ResearchResult[], category: string): any | null {
    const r = results.find(x => x.category === category);
    if (!r) return null;
    try {
      return JSON.parse(this.cleanJsonString(r.snippet));
    } catch {
      console.error(`[Dashboard] Parse failed for ${category}:`, r.snippet.substring(0, 200));
      return null;
    }
  }

  readonly activeSectionId = signal<string | null>(null);
  readonly findingsFilter = signal<string>('ALL');

  /** Stakeholders grouped by hierarchy level */
  readonly stakeholdersByLevel = computed(() => {
    const a = this.analysis();
    if (!a?.stakeholders) return [];
    const sorted = [...a.stakeholders].sort((x, y) => (x.level ?? 4) - (y.level ?? 4));
    const groups: { level: number; label: string; people: typeof sorted }[] = [];
    const levelLabels: Record<number, string> = { 1: 'C-Level / Alta dirección', 2: 'Directores', 3: 'Gerentes', 4: 'Especialistas' };
    for (const s of sorted) {
      const lvl = s.level ?? 4;
      let group = groups.find(g => g.level === lvl);
      if (!group) { group = { level: lvl, label: levelLabels[lvl] ?? `Nivel ${lvl}`, people: [] }; groups.push(group); }
      group.people.push(s);
    }
    return groups;
  });

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

  /** Clean JSON from LLM response — removes markdown code blocks, text around JSON */
  private cleanJsonString(raw: string): string {
    let s = raw.trim();
    if (s.includes('```')) {
      const jsonStart = s.indexOf('```json');
      const altStart = s.indexOf('```{');
      const start = jsonStart >= 0 ? jsonStart : altStart;
      if (start >= 0) {
        const blockStart = s.indexOf('\n', start);
        if (blockStart >= 0) {
          const blockEnd = s.indexOf('```', blockStart);
          if (blockEnd > blockStart) s = s.substring(blockStart + 1, blockEnd).trim();
        }
      }
    }
    const firstBrace = s.indexOf('{');
    const lastBrace = s.lastIndexOf('}');
    if (firstBrace >= 0 && lastBrace > firstBrace) s = s.substring(firstBrace, lastBrace + 1);
    return s;
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
