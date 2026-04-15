import { TestBed } from '@angular/core/testing';
import { FrameworkStateService } from './framework-state.service';

describe('FrameworkStateService', () => {
  let svc: FrameworkStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [FrameworkStateService] });
    svc = TestBed.inject(FrameworkStateService);
  });

  it('starts with null mode/tech and steps tab active', () => {
    expect(svc.mode()).toBeNull();
    expect(svc.techId()).toBeNull();
    expect(svc.activeTab()).toBe('steps');
    expect(svc.checkedSteps()).toEqual({});
  });

  it('progress is 0 when mode or tech missing', () => {
    expect(svc.progress()).toBe(0);
    svc.mode.set('new');
    expect(svc.progress()).toBe(0);
  });

  it('selectMode resets checks and forces steps tab', () => {
    svc.checkedSteps.set({ s1: true });
    svc.activeTab.set('prompts');
    svc.selectMode('new');
    expect(svc.mode()).toBe('new');
    expect(svc.checkedSteps()).toEqual({});
    expect(svc.activeTab()).toBe('steps');
  });

  it('selectTech resets checks and forces steps tab', () => {
    svc.checkedSteps.set({ s1: true });
    svc.activeTab.set('prompts');
    svc.selectTech('angular');
    expect(svc.techId()).toBe('angular');
    expect(svc.checkedSteps()).toEqual({});
    expect(svc.activeTab()).toBe('steps');
  });

  it('toggleStep flips a flag', () => {
    svc.toggleStep('a');
    expect(svc.checkedSteps()).toEqual({ a: true });
    svc.toggleStep('a');
    expect(svc.checkedSteps()).toEqual({ a: false });
  });

  it('resetProgress clears checked steps', () => {
    svc.toggleStep('a');
    svc.resetProgress();
    expect(svc.checkedSteps()).toEqual({});
  });

  it('goBack clears tech first, then mode', () => {
    svc.selectMode('new');
    svc.selectTech('angular');
    svc.goBack();
    expect(svc.techId()).toBeNull();
    expect(svc.mode()).toBe('new');
    svc.goBack();
    expect(svc.mode()).toBeNull();
    svc.goBack();
    expect(svc.mode()).toBeNull();
  });

  it('progress computes percentage of checked steps when mode+tech set', () => {
    svc.selectMode('new');
    svc.selectTech('angular');
    const percent = svc.progress();
    expect(percent).toBeGreaterThanOrEqual(0);
    expect(percent).toBeLessThanOrEqual(100);
  });
});
