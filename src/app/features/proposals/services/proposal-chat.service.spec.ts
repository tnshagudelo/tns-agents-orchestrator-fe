import { TestBed } from '@angular/core/testing';
import { ProposalChatService } from './proposal-chat.service';
import { AuthService } from '../../../core/auth/auth.service';

function mockSseFetch(lines: string[]) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const line of lines) controller.enqueue(encoder.encode(line));
      controller.close();
    },
  });
  return vi.fn().mockResolvedValue(new Response(stream));
}

describe('ProposalChatService', () => {
  let svc: ProposalChatService;
  const authMock = { getToken: () => 'tok-1' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProposalChatService,
        { provide: AuthService, useValue: authMock },
      ],
    });
    svc = TestBed.inject(ProposalChatService);
  });

  it('stripMetricsBlock removes ```json:metrics blocks', () => {
    const input = 'hello\n```json:metrics\n{"teamSize":3}\n```\nbye';
    const out = ProposalChatService.stripMetricsBlock(input);
    expect(out).not.toContain('json:metrics');
    expect(out).toContain('hello');
  });

  it('emits tokens and completes on stream_complete', async () => {
    globalThis.fetch = mockSseFetch([
      'data: Hello\n',
      'data:  world\n',
      'event: stream_complete\n',
    ]);
    const tokens: string[] = [];
    await new Promise<void>((resolve, reject) => {
      svc.sendMessage('p1', 'Proj', 'hi').subscribe({
        next: t => tokens.push(t),
        error: reject,
        complete: resolve,
      });
    });
    expect(tokens).toEqual(['Hello', ' world']);
    expect(svc.isStreaming()).toBe(false);
  });

  it('parses references event block', async () => {
    globalThis.fetch = mockSseFetch([
      'event: references\n',
      `data: [{"fileName":"a","excerpt":"x","relevance":0.9,"category":"c"}]\n`,
      'event: stream_complete\n',
    ]);
    await new Promise<void>((resolve, reject) => {
      svc.sendMessage('p1', 'Proj', 'hi').subscribe({ next: () => {}, error: reject, complete: resolve });
    });
    expect(svc.currentReferences()).toHaveLength(1);
    expect(svc.currentReferences()[0].fileName).toBe('a');
  });

  it('parses metrics event block', async () => {
    globalThis.fetch = mockSseFetch([
      'event: metrics\n',
      `data: {"components":["api"],"teamSize":3,"durationWeeks":4,"riskLevel":"low"}\n`,
      'event: stream_complete\n',
    ]);
    await new Promise<void>((resolve, reject) => {
      svc.sendMessage('p1', 'Proj', 'hi').subscribe({ next: () => {}, error: reject, complete: resolve });
    });
    expect(svc.currentMetrics()?.teamSize).toBe(3);
  });

  it('extracts metrics from embedded markdown block if not sent via SSE', async () => {
    globalThis.fetch = mockSseFetch([
      'data: hello\n',
      'data: \\n```json:metrics\\n\n',
      `data: {"components":[],"teamSize":2,"durationWeeks":1,"riskLevel":"medium"}\\n\n`,
      'data: \\n```\n',
      'event: stream_complete\n',
    ]);
    await new Promise<void>((resolve, reject) => {
      svc.sendMessage('p1', 'Proj', 'hi').subscribe({ next: () => {}, error: reject, complete: resolve });
    });
    expect(svc.currentMetrics()?.teamSize).toBe(2);
    expect(svc.streamingContent()).not.toContain('json:metrics');
  });

  it('tolerates malformed references/metrics JSON without throwing', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    globalThis.fetch = mockSseFetch([
      'event: references\n',
      'data: not json\n',
      'event: metrics\n',
      'data: also not json\n',
      'event: stream_complete\n',
    ]);
    await new Promise<void>((resolve, reject) => {
      svc.sendMessage('p1', 'Proj', 'hi').subscribe({ next: () => {}, error: reject, complete: resolve });
    });
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('surfaces event: error', async () => {
    globalThis.fetch = mockSseFetch(['event: error\n']);
    await expect(new Promise<void>((_resolve, reject) => {
      svc.sendMessage('p1', 'Proj', 'hi').subscribe({ next: () => {}, error: reject, complete: () => {} });
    })).rejects.toBeTruthy();
  });

  it('reuses the same sessionId across messages for the same proposal', async () => {
    globalThis.fetch = mockSseFetch(['event: stream_complete\n']);
    await new Promise<void>(r => svc.sendMessage('p1', 'Proj', 'a').subscribe({ complete: r, error: r }));
    const body1 = JSON.parse((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);

    globalThis.fetch = mockSseFetch(['event: stream_complete\n']);
    await new Promise<void>(r => svc.sendMessage('p1', 'Proj', 'b').subscribe({ complete: r, error: r }));
    const body2 = JSON.parse((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);

    expect(body1.metadata.sessionId).toBe(body2.metadata.sessionId);
  });

  it('resetSession rotates the sessionId', async () => {
    globalThis.fetch = mockSseFetch(['event: stream_complete\n']);
    await new Promise<void>(r => svc.sendMessage('p1', 'Proj', 'a').subscribe({ complete: r, error: r }));
    const body1 = JSON.parse((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);

    svc.resetSession('p1');
    globalThis.fetch = mockSseFetch(['event: stream_complete\n']);
    await new Promise<void>(r => svc.sendMessage('p1', 'Proj', 'b').subscribe({ complete: r, error: r }));
    const body2 = JSON.parse((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);

    expect(body1.metadata.sessionId).not.toBe(body2.metadata.sessionId);
  });

  it('stopStream aborts and clears isStreaming', () => {
    svc.stopStream();
    expect(svc.isStreaming()).toBe(false);
  });

  it('fetch rejection surfaces as observable error', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('neterr'));
    await expect(new Promise<void>((_r, reject) => {
      svc.sendMessage('p1', 'Proj', 'x').subscribe({ next: () => {}, error: reject, complete: () => {} });
    })).rejects.toThrow('neterr');
  });
});
