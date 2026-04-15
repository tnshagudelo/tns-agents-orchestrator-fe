import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMarkdown } from 'ngx-markdown';
import { provideHttpClient } from '@angular/common/http';
import { ClaudeMdTabComponent } from './claude-md-tab.component';
import { FrameworkStateService } from '../../services/framework-state.service';
import { ClipboardService } from '../../services/clipboard.service';

describe('ClaudeMdTabComponent', () => {
  let state: FrameworkStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ClaudeMdTabComponent, NoopAnimationsModule],
      providers: [
        FrameworkStateService,
        ClipboardService,
        provideHttpClient(),
        provideMarkdown(),
      ],
    });
    state = TestBed.inject(FrameworkStateService);
  });

  it('content is empty without tech, populated for single-repo, populated for multi-repo', () => {
    const fixture = TestBed.createComponent(ClaudeMdTabComponent);
    expect(fixture.componentInstance.content()).toBe('');

    state.selectMode('new');
    state.selectTech('angular');
    expect(fixture.componentInstance.content()).toBeTruthy();

    state.selectMode('multi-repo');
    state.selectTech('angular');
    expect(fixture.componentInstance.content()).toBeTruthy();
  });

  it('copyAll delegates to clipboard', () => {
    const clip = TestBed.inject(ClipboardService);
    const spy = vi.spyOn(clip, 'copy').mockResolvedValue();
    state.selectMode('new');
    state.selectTech('angular');
    const fixture = TestBed.createComponent(ClaudeMdTabComponent);
    fixture.componentInstance.copyAll();
    expect(spy).toHaveBeenCalled();
  });
});
