import { TestBed } from '@angular/core/testing';
import { NotificationToastComponent } from './notification-toast.component';
import { NotificationService } from '../../../core/services/notification.service';

describe('NotificationToastComponent', () => {
  let svc: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NotificationToastComponent],
      providers: [NotificationService],
    });
    svc = TestBed.inject(NotificationService);
  });

  it('iconForType returns icons per known type and fallback', () => {
    const fixture = TestBed.createComponent(NotificationToastComponent);
    const cmp = fixture.componentInstance as unknown as { iconForType: (t: string) => string };
    expect(cmp.iconForType('success')).toBe('check_circle');
    expect(cmp.iconForType('error')).toBe('error');
    expect(cmp.iconForType('warning')).toBe('warning');
    expect(cmp.iconForType('info')).toBe('info');
    expect(cmp.iconForType('other')).toBe('info');
  });

  it('renders notifications from the service', async () => {
    svc.show('success', 'Saved', 0);
    const fixture = TestBed.createComponent(NotificationToastComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Saved');
  });
});
