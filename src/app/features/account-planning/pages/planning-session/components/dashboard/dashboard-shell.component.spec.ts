import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMarkdown } from 'ngx-markdown';
import { provideHttpClient } from '@angular/common/http';
import { DashboardShellComponent } from './dashboard-shell.component';
import { TranslationService } from '../../../../../../core/i18n/translation.service';

const client = { id: 'c1', name: 'Acme' };

function setup(results: unknown[] = [], sessions: unknown[] = [], currentSessionId = 'sess-1') {
  const fixture = TestBed.createComponent(DashboardShellComponent);
  fixture.componentRef.setInput('client', client);
  fixture.componentRef.setInput('results', results);
  fixture.componentRef.setInput('clientSessions', sessions);
  fixture.componentRef.setInput('currentSessionId', currentSessionId);
  // Intentionally do NOT call detectChanges: the rich template requires many
  // fully-populated analysis fields to render; we exercise computed/methods directly.
  return fixture;
}

describe('DashboardShellComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DashboardShellComponent, NoopAnimationsModule],
      providers: [TranslationService, provideHttpClient(), provideMarkdown()],
    });
  });

  it('no results → analysis null, not loaded, no errors', () => {
    const fixture = setup();
    expect(fixture.componentInstance.analysis()).toBeNull();
    expect(fixture.componentInstance.resultsLoaded()).toBe(false);
    expect(fixture.componentInstance.hasParseError()).toBe(false);
    expect(fixture.componentInstance.hasNoAnalysis()).toBe(false);
  });

  it('results without analysis categories → hasNoAnalysis true', () => {
    const fixture = setup([{ category: 'other', snippet: 'x' }]);
    expect(fixture.componentInstance.hasNoAnalysis()).toBe(true);
  });

  it('parses 3-part analysis pipeline', () => {
    const fixture = setup([
      { category: 'analysis-part1', snippet: '{"clientCard":{"name":"Acme","industry":"T","country":"CO","estimatedSize":"M","summary":""}}', createdAt: new Date() },
      { category: 'analysis-part2', snippet: '{"keyFindings":[{"type":"NEWS"}],"stakeholders":[{"level":2}]}', createdAt: new Date() },
      { category: 'analysis-part3', snippet: '{"painValueServiceMap":[{"pain":"p","value":"v","service":"s"}]}', createdAt: new Date() },
    ]);
    const a = fixture.componentInstance.analysis();
    expect(a).not.toBeNull();
    expect(a!.keyFindings).toHaveLength(1);
    expect(fixture.componentInstance.stakeholdersByLevel().length).toBeGreaterThan(0);
  });

  it('falls back to legacy analysis-structured format', () => {
    const fixture = setup([
      { category: 'analysis-structured', snippet: '```json\n{"clientCard":{"name":"a","industry":"","country":"","estimatedSize":"","summary":""}}\n```', createdAt: new Date() },
    ]);
    expect(fixture.componentInstance.analysis()).not.toBeNull();
  });

  it('parse failure on legacy produces null analysis and hasParseError', () => {
    const fixture = setup([
      { category: 'analysis', snippet: 'not json', createdAt: new Date() },
    ]);
    expect(fixture.componentInstance.analysis()).toBeNull();
    expect(fixture.componentInstance.hasParseError()).toBe(true);
  });

  it('findingsFilter filters key findings', () => {
    const fixture = setup([
      { category: 'analysis-part2', snippet: '{"keyFindings":[{"type":"NEWS"},{"type":"TECH"}]}', createdAt: new Date() },
    ]);
    fixture.componentInstance.findingsFilter.set('NEWS');
    expect(fixture.componentInstance.filteredFindings()).toHaveLength(1);
    fixture.componentInstance.findingsFilter.set('ALL');
    expect(fixture.componentInstance.filteredFindings()).toHaveLength(2);
    expect(fixture.componentInstance.findingTypes()).toContain('ALL');
  });

  it('getStakeholderColor/Label/getPriorityColor/getHorizonLabel fall back to defaults', () => {
    const fixture = setup();
    expect(fixture.componentInstance.getStakeholderColor('STRATEGIC_DECISOR')).toBe('#7c3aed');
    expect(fixture.componentInstance.getStakeholderColor('other')).toBe('#6b7280');
    expect(fixture.componentInstance.getStakeholderLabel('TECH_DECISOR')).toBe('Decisor técnico');
    expect(fixture.componentInstance.getStakeholderLabel('other')).toBe('other');
    expect(fixture.componentInstance.getPriorityColor('HIGH')).toBe('#059669');
    expect(fixture.componentInstance.getPriorityColor('unknown')).toBe('#6b7280');
    expect(fixture.componentInstance.getHorizonLabel('SHORT_TERM')).toBe('Corto plazo');
    expect(fixture.componentInstance.getHorizonLabel('unknown')).toBe('unknown');
  });

  it('getMetricEntries handles undefined and object', () => {
    const fixture = setup();
    expect(fixture.componentInstance.getMetricEntries(undefined)).toEqual([]);
    expect(fixture.componentInstance.getMetricEntries({ a: 'b' })).toEqual([{ key: 'a', value: 'b' }]);
  });

  it('toggleFindingRelevance flips isRelevant', () => {
    const fixture = setup();
    const finding = { isRelevant: true } as never as Parameters<typeof fixture.componentInstance.toggleFindingRelevance>[0];
    fixture.componentInstance.toggleFindingRelevance(finding);
    expect((finding as { isRelevant: boolean }).isRelevant).toBe(false);
  });

  it('scrollTo updates active section', () => {
    const fixture = setup();
    fixture.componentInstance.scrollTo('challenges');
    expect(fixture.componentInstance.activeSectionId()).toBe('challenges');
  });

  it('copyText uses clipboard', () => {
    const writeText = vi.fn();
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const fixture = setup();
    fixture.componentInstance.copyText('hello');
    expect(writeText).toHaveBeenCalledWith('hello');
  });

  it('copyPainValueTable no-ops without analysis, serializes table when present', () => {
    const writeText = vi.fn();
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const empty = setup();
    empty.componentInstance.copyPainValueTable();
    expect(writeText).not.toHaveBeenCalled();

    const withData = setup([
      { category: 'analysis-part3', snippet: '{"painValueServiceMap":[{"pain":"p","value":"v","service":"s"}]}', createdAt: new Date() },
    ]);
    withData.componentInstance.copyPainValueTable();
    expect(writeText).toHaveBeenCalled();
  });

  it('otherSessions filters and sorts other sessions', () => {
    const fixture = setup([], [
      { id: 'sess-1', status: 'Approved', updatedAt: new Date('2026-01-03') },
      { id: 's2', status: 'Approved', updatedAt: new Date('2026-01-02') },
      { id: 's3', status: 'Queued', updatedAt: new Date('2026-01-01') },
      { id: 's4', status: 'AwaitingReview', updatedAt: new Date('2026-01-04') },
    ], 'sess-1');
    const list = fixture.componentInstance.otherSessions();
    expect(list.map(s => s.id)).toEqual(['s4', 's2']);
  });

  it('navItems lists all sections', () => {
    const fixture = setup();
    expect(fixture.componentInstance.navItems().length).toBe(13);
  });

  it('getStatusLabel resolves known and falls back to raw status', () => {
    const fixture = setup();
    expect(typeof fixture.componentInstance.getStatusLabel('Queued')).toBe('string');
    expect(fixture.componentInstance.getStatusLabel('WeirdStatus')).toBe('WeirdStatus');
  });
});
