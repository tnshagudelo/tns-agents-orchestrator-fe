import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StepsTabComponent } from './steps-tab.component';
import { FrameworkStateService } from '../../services/framework-state.service';
import { ClipboardService } from '../../services/clipboard.service';

describe('StepsTabComponent', () => {
  let state: FrameworkStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StepsTabComponent, NoopAnimationsModule],
      providers: [FrameworkStateService, ClipboardService],
    });
    state = TestBed.inject(FrameworkStateService);
  });

  it('returns empty list when mode/tech missing, populates when set', () => {
    const fixture = TestBed.createComponent(StepsTabComponent);
    expect(fixture.componentInstance.steps()).toEqual([]);
    state.selectMode('new');
    state.selectTech('angular');
    expect(fixture.componentInstance.steps().length).toBeGreaterThan(0);
  });

  it('isChecked reflects state', () => {
    const fixture = TestBed.createComponent(StepsTabComponent);
    state.checkedSteps.set({ x: true });
    expect(fixture.componentInstance.isChecked('x')).toBe(true);
    expect(fixture.componentInstance.isChecked('y')).toBe(false);
  });

  it('copy delegates to clipboard', () => {
    const clip = TestBed.inject(ClipboardService);
    const spy = vi.spyOn(clip, 'copy').mockResolvedValue();
    const fixture = TestBed.createComponent(StepsTabComponent);
    fixture.componentInstance.copy('hi', 'id');
    expect(spy).toHaveBeenCalledWith('hi', 'id');
  });

  it('tagLabel returns labels', () => {
    const fixture = TestBed.createComponent(StepsTabComponent);
    expect(fixture.componentInstance.tagLabel('context')).toBe('Contexto');
    expect(fixture.componentInstance.tagLabel('spec')).toBe('Spec');
    expect(fixture.componentInstance.tagLabel('validate')).toBe('Validar');
  });
});
