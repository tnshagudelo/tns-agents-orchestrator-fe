import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PromptsTabComponent } from './prompts-tab.component';
import { FrameworkStateService } from '../../services/framework-state.service';
import { ClipboardService } from '../../services/clipboard.service';

describe('PromptsTabComponent', () => {
  let state: FrameworkStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PromptsTabComponent, NoopAnimationsModule],
      providers: [FrameworkStateService, ClipboardService],
    });
    state = TestBed.inject(FrameworkStateService);
  });

  it('empty when mode/tech missing, populated when set', () => {
    const fixture = TestBed.createComponent(PromptsTabComponent);
    expect(fixture.componentInstance.prompts()).toEqual([]);
    state.selectMode('new');
    state.selectTech('angular');
    expect(fixture.componentInstance.prompts().length).toBeGreaterThan(0);
  });

  it('copy delegates to clipboard', () => {
    const clip = TestBed.inject(ClipboardService);
    const spy = vi.spyOn(clip, 'copy').mockResolvedValue();
    const fixture = TestBed.createComponent(PromptsTabComponent);
    fixture.componentInstance.copy('hi', 'id');
    expect(spy).toHaveBeenCalledWith('hi', 'id');
  });
});
