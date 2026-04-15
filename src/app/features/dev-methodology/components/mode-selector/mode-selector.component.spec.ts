import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ModeSelectorComponent } from './mode-selector.component';
import { FrameworkStateService } from '../../services/framework-state.service';

describe('ModeSelectorComponent', () => {
  let router: { navigate: ReturnType<typeof vi.fn> };
  let state: FrameworkStateService;

  beforeEach(() => {
    router = { navigate: vi.fn() };
    TestBed.configureTestingModule({
      imports: [ModeSelectorComponent, NoopAnimationsModule],
      providers: [
        FrameworkStateService,
        provideRouter([]),
        { provide: Router, useValue: router },
      ],
    });
    state = TestBed.inject(FrameworkStateService);
  });

  it('renders and exposes modes/why/concepts metadata', async () => {
    const fixture = TestBed.createComponent(ModeSelectorComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.modes.length).toBeGreaterThan(0);
    expect(fixture.componentInstance.whyCards.length).toBeGreaterThan(0);
    expect(fixture.componentInstance.concepts.length).toBeGreaterThan(0);
  });

  it('select navigates and updates state mode', () => {
    const fixture = TestBed.createComponent(ModeSelectorComponent);
    fixture.componentInstance.select('new');
    expect(state.mode()).toBe('new');
    expect(router.navigate).toHaveBeenCalledWith(['/dev-methodology/tech']);
  });

  it('copyPrompt calls clipboard and sets flag briefly', () => {
    vi.useFakeTimers();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
    const fixture = TestBed.createComponent(ModeSelectorComponent);
    fixture.componentInstance.copyPrompt();
    expect(fixture.componentInstance.promptCopied).toBe(true);
    vi.advanceTimersByTime(2000);
    expect(fixture.componentInstance.promptCopied).toBe(false);
    vi.useRealTimers();
  });
});
