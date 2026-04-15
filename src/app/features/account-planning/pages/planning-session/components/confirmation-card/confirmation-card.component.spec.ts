import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMarkdown } from 'ngx-markdown';
import { provideHttpClient } from '@angular/common/http';
import { ConfirmationCardComponent } from './confirmation-card.component';

describe('ConfirmationCardComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ConfirmationCardComponent, NoopAnimationsModule],
      providers: [provideHttpClient(), provideMarkdown()],
    });
  });

  it('renders with required summary input', async () => {
    const fixture = TestBed.createComponent(ConfirmationCardComponent);
    fixture.componentRef.setInput('summary', '# Hello');
    fixture.componentRef.setInput('clientName', 'Acme');
    fixture.detectChanges();
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toBeTruthy();
  });

  it('emits confirmed/rejected events', () => {
    const fixture = TestBed.createComponent(ConfirmationCardComponent);
    fixture.componentRef.setInput('summary', '');
    const events: string[] = [];
    fixture.componentInstance.confirmed.subscribe(() => events.push('c'));
    fixture.componentInstance.rejected.subscribe(() => events.push('r'));
    fixture.componentInstance.confirmed.emit();
    fixture.componentInstance.rejected.emit();
    expect(events).toEqual(['c', 'r']);
  });
});
