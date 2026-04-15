import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SessionTableComponent } from './session-table.component';

describe('SessionTableComponent', () => {
  it('statusIcon maps status to icon', () => {
    TestBed.configureTestingModule({ imports: [SessionTableComponent, NoopAnimationsModule] });
    const fixture = TestBed.createComponent(SessionTableComponent);
    fixture.componentRef.setInput('sessions', []);
    expect(fixture.componentInstance.statusIcon('active')).toBe('play_circle');
    expect(fixture.componentInstance.statusIcon('completed')).toBe('check_circle');
    expect(fixture.componentInstance.statusIcon('error')).toBe('error');
    expect(fixture.componentInstance.statusIcon('timeout')).toBe('timer_off');
  });

  it('formatDuration handles ms/s/m', () => {
    TestBed.configureTestingModule({ imports: [SessionTableComponent, NoopAnimationsModule] });
    const fixture = TestBed.createComponent(SessionTableComponent);
    fixture.componentRef.setInput('sessions', []);
    expect(fixture.componentInstance.formatDuration(500)).toBe('500ms');
    expect(fixture.componentInstance.formatDuration(5000)).toBe('5s');
    expect(fixture.componentInstance.formatDuration(125_000)).toBe('2m 5s');
  });

  it('renders empty state with no sessions', async () => {
    TestBed.configureTestingModule({ imports: [SessionTableComponent, NoopAnimationsModule] });
    const fixture = TestBed.createComponent(SessionTableComponent);
    fixture.componentRef.setInput('sessions', []);
    fixture.detectChanges();
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('.empty-state')).toBeTruthy();
  });
});
