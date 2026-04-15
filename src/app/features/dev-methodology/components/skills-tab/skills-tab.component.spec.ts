import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SkillsTabComponent } from './skills-tab.component';
import { FrameworkStateService } from '../../services/framework-state.service';
import { ClipboardService } from '../../services/clipboard.service';

describe('SkillsTabComponent', () => {
  let state: FrameworkStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SkillsTabComponent, NoopAnimationsModule],
      providers: [FrameworkStateService, ClipboardService],
    });
    state = TestBed.inject(FrameworkStateService);
  });

  it('empty when mode missing, populated when set', () => {
    const fixture = TestBed.createComponent(SkillsTabComponent);
    expect(fixture.componentInstance.skills()).toEqual([]);
    state.selectMode('new');
    expect(fixture.componentInstance.skills().length).toBeGreaterThan(0);
  });

  it('toggleSkill expands/collapses', () => {
    const fixture = TestBed.createComponent(SkillsTabComponent);
    fixture.componentInstance.toggleSkill('x');
    expect(fixture.componentInstance.expandedSkill).toBe('x');
    fixture.componentInstance.toggleSkill('x');
    expect(fixture.componentInstance.expandedSkill).toBeNull();
    fixture.componentInstance.toggleSkill('y');
    expect(fixture.componentInstance.expandedSkill).toBe('y');
  });

  it('copy stops propagation and delegates', () => {
    const clip = TestBed.inject(ClipboardService);
    const spy = vi.spyOn(clip, 'copy').mockResolvedValue();
    const fixture = TestBed.createComponent(SkillsTabComponent);
    const ev = { stopPropagation: vi.fn() } as unknown as Event;
    fixture.componentInstance.copy('t', 'i', ev);
    expect(ev.stopPropagation).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith('t', 'i');
  });
});
