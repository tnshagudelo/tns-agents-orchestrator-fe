import { TestBed } from '@angular/core/testing';
import { ClipboardService } from './clipboard.service';

describe('ClipboardService', () => {
  let svc: ClipboardService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({ providers: [ClipboardService] });
    svc = TestBed.inject(ClipboardService);
  });

  afterEach(() => vi.useRealTimers());

  it('copy uses navigator.clipboard when available and clears after 2s', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    await svc.copy('hello', 'id-1');
    expect(writeText).toHaveBeenCalledWith('hello');
    expect(svc.isCopied('id-1')).toBe(true);
    vi.advanceTimersByTime(2000);
    expect(svc.isCopied('id-1')).toBe(false);
  });

  it('falls back to execCommand when clipboard API throws', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('no'));
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const exec = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, 'execCommand', { value: exec, configurable: true, writable: true });
    await svc.copy('hello', 'id-2');
    expect(exec).toHaveBeenCalledWith('copy');
    expect(svc.isCopied('id-2')).toBe(true);
    vi.advanceTimersByTime(2000);
    expect(svc.isCopied('id-2')).toBe(false);
  });

  it('second copy before first timer fires leaves latest id active until its own timer', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    await svc.copy('a', 'id-a');
    vi.advanceTimersByTime(500);
    await svc.copy('b', 'id-b');
    // First timer fires at t=2000 (still id-b active, so no-op). Second timer fires at t=2500.
    vi.advanceTimersByTime(1500); // t=2000
    expect(svc.isCopied('id-b')).toBe(true);
    vi.advanceTimersByTime(500); // t=2500
    expect(svc.copiedId()).toBeNull();
  });
});
