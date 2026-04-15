import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({ providers: [NotificationService] });
    service = TestBed.inject(NotificationService);
  });

  afterEach(() => vi.useRealTimers());

  it('starts empty', () => {
    expect(service.notifications()).toEqual([]);
    expect(service.hasNotifications()).toBe(false);
  });

  it('show adds a notification with a generated id', () => {
    service.show('info', 'hello', 1000);
    const list = service.notifications();
    expect(list).toHaveLength(1);
    expect(list[0].message).toBe('hello');
    expect(list[0].type).toBe('info');
    expect(list[0].id).toBeTruthy();
    expect(service.hasNotifications()).toBe(true);
  });

  it('auto-dismisses after duration', () => {
    service.show('info', 'temp', 1000);
    expect(service.notifications()).toHaveLength(1);
    vi.advanceTimersByTime(1000);
    expect(service.notifications()).toHaveLength(0);
  });

  it('does not auto-dismiss when duration is 0', () => {
    service.show('info', 'sticky', 0);
    vi.advanceTimersByTime(10_000);
    expect(service.notifications()).toHaveLength(1);
  });

  it('success/warning/info use default duration 4000', () => {
    service.success('s');
    service.warning('w');
    service.info('i');
    expect(service.notifications()).toHaveLength(3);
    vi.advanceTimersByTime(4000);
    expect(service.notifications()).toHaveLength(0);
  });

  it('error uses 6000ms duration', () => {
    service.error('boom');
    vi.advanceTimersByTime(4000);
    expect(service.notifications()).toHaveLength(1);
    vi.advanceTimersByTime(2000);
    expect(service.notifications()).toHaveLength(0);
  });

  it('dismiss removes only the matching id', () => {
    service.show('info', 'a', 0);
    service.show('info', 'b', 0);
    const [first] = service.notifications();
    service.dismiss(first.id);
    const remaining = service.notifications();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].message).toBe('b');
  });
});
