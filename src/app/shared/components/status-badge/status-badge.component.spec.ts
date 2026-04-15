import { TestBed } from '@angular/core/testing';
import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  it('renders the provided status in the badge text', async () => {
    TestBed.configureTestingModule({ imports: [StatusBadgeComponent] });
    const fixture = TestBed.createComponent(StatusBadgeComponent);
    fixture.componentRef.setInput('status', 'running');
    fixture.detectChanges();
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent?.toLowerCase()).toContain('running');
  });

  it('renders with a different status', async () => {
    TestBed.configureTestingModule({ imports: [StatusBadgeComponent] });
    const fixture = TestBed.createComponent(StatusBadgeComponent);
    fixture.componentRef.setInput('status', 'completed');
    fixture.detectChanges();
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent?.toLowerCase()).toContain('completed');
  });
});
