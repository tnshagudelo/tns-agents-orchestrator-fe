import { TestBed } from '@angular/core/testing';
import { LogViewerComponent } from './log-viewer.component';

describe('LogViewerComponent', () => {
  it('renders with empty logs', async () => {
    TestBed.configureTestingModule({ imports: [LogViewerComponent] });
    const fixture = TestBed.createComponent(LogViewerComponent);
    fixture.componentRef.setInput('logs', []);
    fixture.detectChanges();
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('.log-viewer')).toBeTruthy();
  });

  it('renders log entries', async () => {
    TestBed.configureTestingModule({ imports: [LogViewerComponent] });
    const fixture = TestBed.createComponent(LogViewerComponent);
    fixture.componentRef.setInput('logs', [
      { id: '1', level: 'info', message: 'hello', timestamp: new Date().toISOString(), agentId: 'a' },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('hello');
  });
});
