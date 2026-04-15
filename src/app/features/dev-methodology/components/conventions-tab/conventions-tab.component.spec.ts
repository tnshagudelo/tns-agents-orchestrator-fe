import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ConventionsTabComponent } from './conventions-tab.component';
import { FrameworkStateService } from '../../services/framework-state.service';
import { ClipboardService } from '../../services/clipboard.service';

describe('ConventionsTabComponent', () => {
  let state: FrameworkStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ConventionsTabComponent, NoopAnimationsModule],
      providers: [FrameworkStateService, ClipboardService],
    });
    state = TestBed.inject(FrameworkStateService);
  });

  it('tech/commandEntries empty without techId, populated when set', () => {
    const fixture = TestBed.createComponent(ConventionsTabComponent);
    expect(fixture.componentInstance.tech()).toBeUndefined();
    expect(fixture.componentInstance.commandEntries()).toEqual([]);
    state.selectTech('angular');
    expect(fixture.componentInstance.tech()).toBeTruthy();
    expect(fixture.componentInstance.commandEntries().length).toBeGreaterThan(0);
  });

  it('copy delegates to clipboard', () => {
    const clip = TestBed.inject(ClipboardService);
    const spy = vi.spyOn(clip, 'copy').mockResolvedValue();
    const fixture = TestBed.createComponent(ConventionsTabComponent);
    fixture.componentInstance.copy('t', 'i');
    expect(spy).toHaveBeenCalledWith('t', 'i');
  });
});
