import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SearchProgressComponent } from './search-progress.component';

function setup(job: Partial<Record<string, unknown>>) {
  const fixture = TestBed.createComponent(SearchProgressComponent);
  fixture.componentRef.setInput('job', job);
  fixture.componentRef.setInput('clientName', 'Acme');
  fixture.detectChanges();
  return fixture;
}

describe('SearchProgressComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SearchProgressComponent, NoopAnimationsModule] });
  });
  it('activityLog maps stepLog, marking current step as not done', () => {
    const fixture = setup({
      progress: 50,
      currentStep: 'step B',
      stepLog: [
        { message: 'step A', timestamp: '2026-01-01T00:00:00Z' },
        { message: 'step B', timestamp: '2026-01-02T00:00:00Z' },
      ],
    });
    const log = fixture.componentInstance.activityLog();
    expect(log).toHaveLength(2);
    expect(log[0].done).toBe(true);
    expect(log[1].done).toBe(false);
  });

  it('activityLog handles missing stepLog', () => {
    const fixture = setup({ progress: 0 });
    expect(fixture.componentInstance.activityLog()).toEqual([]);
  });

  it('estimatedTime spans all branches by progress', () => {
    expect(setup({ progress: 95 }).componentInstance.estimatedTime()).toBe('Casi listo...');
    expect(setup({ progress: 85 }).componentInstance.estimatedTime()).toBe('Menos de 1 minuto');
    expect(setup({ progress: 60 }).componentInstance.estimatedTime()).toBe('~1-2 minutos');
    expect(setup({ progress: 35 }).componentInstance.estimatedTime()).toBe('~2-3 minutos');
    expect(setup({ progress: 10 }).componentInstance.estimatedTime()).toBe('~3-5 minutos');
  });
});
