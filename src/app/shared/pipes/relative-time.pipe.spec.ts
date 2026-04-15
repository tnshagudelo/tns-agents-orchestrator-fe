import { RelativeTimePipe } from './relative-time.pipe';

describe('RelativeTimePipe', () => {
  let pipe: RelativeTimePipe;

  beforeEach(() => {
    pipe = new RelativeTimePipe();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-14T12:00:00Z'));
  });

  afterEach(() => vi.useRealTimers());

  const delta = (ms: number) => new Date(Date.now() - ms);

  it('returns empty string when value is null/undefined', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('"Hace un momento" for <60s', () => {
    expect(pipe.transform(delta(10_000))).toBe('Hace un momento');
  });

  it('minutes for <60m', () => {
    expect(pipe.transform(delta(5 * 60_000))).toBe('Hace 5 min');
  });

  it('hours for <24h', () => {
    expect(pipe.transform(delta(3 * 3600_000))).toBe('Hace 3h');
  });

  it('"Ayer" for exactly 1 day', () => {
    expect(pipe.transform(delta(24 * 3600_000))).toBe('Ayer');
  });

  it('days for 2-6 days', () => {
    expect(pipe.transform(delta(3 * 24 * 3600_000))).toBe('Hace 3 días');
  });

  it('weeks for 7-29 days', () => {
    expect(pipe.transform(delta(14 * 24 * 3600_000))).toBe('Hace 2 sem');
  });

  it('full date for 30+ days', () => {
    const result = pipe.transform(delta(40 * 24 * 3600_000));
    expect(result).toMatch(/\d/);
  });

  it('accepts string ISO dates', () => {
    expect(pipe.transform(new Date(Date.now() - 10_000).toISOString())).toBe('Hace un momento');
  });
});
