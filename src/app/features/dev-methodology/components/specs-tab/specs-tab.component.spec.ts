import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMarkdown } from 'ngx-markdown';
import { provideHttpClient } from '@angular/common/http';
import { SpecsTabComponent } from './specs-tab.component';
import { FrameworkStateService } from '../../services/framework-state.service';
import { ClipboardService } from '../../services/clipboard.service';

describe('SpecsTabComponent', () => {
  let state: FrameworkStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SpecsTabComponent, NoopAnimationsModule],
      providers: [
        FrameworkStateService,
        ClipboardService,
        provideHttpClient(),
        provideMarkdown(),
      ],
    });
    state = TestBed.inject(FrameworkStateService);
  });

  it('uses single-repo specs when tech is set and mode != multi-repo', () => {
    state.selectMode('new');
    state.selectTech('angular');
    const fixture = TestBed.createComponent(SpecsTabComponent);
    expect(fixture.componentInstance.specFiles().length).toBeGreaterThan(0);
    expect(fixture.componentInstance.indexContent()).toBeTruthy();
  });

  it('uses multi-repo specs when mode is multi-repo', () => {
    state.selectMode('multi-repo');
    const fixture = TestBed.createComponent(SpecsTabComponent);
    expect(fixture.componentInstance.specFiles().length).toBeGreaterThan(0);
    expect(fixture.componentInstance.indexContent()).toBeTruthy();
  });

  it('returns empty specFiles when no tech and not multi-repo', () => {
    const fixture = TestBed.createComponent(SpecsTabComponent);
    expect(fixture.componentInstance.specFiles()).toEqual([]);
    expect(fixture.componentInstance.indexContent()).toBe('');
  });

  it('copyIndex and copySpec delegate to clipboard', () => {
    const clip = TestBed.inject(ClipboardService);
    const spy = vi.spyOn(clip, 'copy').mockResolvedValue();
    state.selectMode('new');
    state.selectTech('angular');
    const fixture = TestBed.createComponent(SpecsTabComponent);
    fixture.componentInstance.copyIndex();
    fixture.componentInstance.copySpec({ name: 'a', purpose: 'p', example: 'e' });
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
