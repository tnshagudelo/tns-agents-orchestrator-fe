import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ProposalDiffComponent } from './proposal-diff.component';
import { ProposalIteration } from '../../models/proposal.model';

const iter = (overrides: Partial<ProposalIteration> = {}): ProposalIteration => ({
  version: 1,
  content: '',
  components: [],
  teamSize: 0,
  durationWeeks: 0,
  riskLevel: 'low',
  createdAt: new Date(),
  ...overrides,
});

function setup(current: ProposalIteration, previous: ProposalIteration | null = null) {
  TestBed.configureTestingModule({ imports: [ProposalDiffComponent, NoopAnimationsModule] });
  const fixture = TestBed.createComponent(ProposalDiffComponent);
  fixture.componentRef.setInput('current', current);
  fixture.componentRef.setInput('previous', previous);
  fixture.detectChanges();
  return fixture;
}

describe('ProposalDiffComponent', () => {
  it('without previous: no added/removed, all components unchanged, no metric diffs', () => {
    const fixture = setup(iter({ components: ['a', 'b'] }));
    expect(fixture.componentInstance.addedComponents()).toEqual([]);
    expect(fixture.componentInstance.removedComponents()).toEqual([]);
    expect(fixture.componentInstance.unchangedComponents()).toEqual(['a', 'b']);
    expect(fixture.componentInstance.metricChanges()).toEqual([]);
  });

  it('with previous: computes added/removed/unchanged', () => {
    const fixture = setup(
      iter({ components: ['a', 'b'] }),
      iter({ components: ['b', 'c'] }),
    );
    expect(fixture.componentInstance.addedComponents()).toEqual(['a']);
    expect(fixture.componentInstance.removedComponents()).toEqual(['c']);
    expect(fixture.componentInstance.unchangedComponents()).toEqual(['b']);
  });

  it('metricChanges flags each metric', () => {
    const fixture = setup(
      iter({ teamSize: 3, durationWeeks: 8, riskLevel: 'high' }),
      iter({ teamSize: 3, durationWeeks: 4, riskLevel: 'low' }),
    );
    const changes = fixture.componentInstance.metricChanges();
    expect(changes[0].changed).toBe(false);
    expect(changes[1].changed).toBe(true);
    expect(changes[2].changed).toBe(true);
  });
});
