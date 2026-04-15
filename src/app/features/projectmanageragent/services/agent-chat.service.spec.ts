import { TestBed } from '@angular/core/testing';
import { AgentChatService } from './agent-chat.service';

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

describe('AgentChatService', () => {
  let svc: AgentChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [AgentChatService] });
    svc = TestBed.inject(AgentChatService);
  });

  it('emits tokens and completes on stream_complete', async () => {
    globalThis.fetch = mockSseFetch([
      'data: Hi\n',
      'data:  there\n',
      'data: stream_complete\n',
    ]);
    const tokens: string[] = [];
    await new Promise<void>((resolve, reject) => {
      svc.sendMessage('hi', 'Proj', 'tok').subscribe({
        next: t => tokens.push(t),
        error: reject,
        complete: resolve,
      });
    });
    expect(tokens).toEqual(['Hi', ' there']);
  });

  it('parses references block', async () => {
    globalThis.fetch = mockSseFetch([
      'event: references\n',
      `data: [{"fileName":"a","excerpt":"x","relevance":0.9,"category":"c"}]\n`,
      'data: stream_complete\n',
    ]);
    await new Promise<void>((resolve, reject) => {
      svc.sendMessage('hi', 'Proj', 'tok').subscribe({ next: () => {}, error: reject, complete: resolve });
    });
    expect(svc.currentReferences()).toHaveLength(1);
  });

  it('tolerates malformed references JSON', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    globalThis.fetch = mockSseFetch([
      'event: references\n',
      'data: not json\n',
      'data: stream_complete\n',
    ]);
    await new Promise<void>((resolve, reject) => {
      svc.sendMessage('hi', 'Proj', 'tok').subscribe({ next: () => {}, error: reject, complete: resolve });
    });
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('surfaces event: error', async () => {
    globalThis.fetch = mockSseFetch(['event: error\n']);
    await expect(new Promise<void>((_r, reject) => {
      svc.sendMessage('hi', 'Proj', 'tok').subscribe({ next: () => {}, error: reject, complete: () => {} });
    })).rejects.toBeTruthy();
  });

  it('resetSession rotates sessionId', async () => {
    globalThis.fetch = mockSseFetch(['data: stream_complete\n']);
    await new Promise<void>(r => svc.sendMessage('a', 'P', 't').subscribe({ complete: r, error: r }));
    const body1 = JSON.parse((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);

    svc.resetSession();
    globalThis.fetch = mockSseFetch(['data: stream_complete\n']);
    await new Promise<void>(r => svc.sendMessage('b', 'P', 't').subscribe({ complete: r, error: r }));
    const body2 = JSON.parse((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);

    expect(body1.metadata.sessionId).not.toBe(body2.metadata.sessionId);
    expect(svc.currentReferences()).toEqual([]);
  });

  it('fetch rejection surfaces error', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('neterr'));
    await expect(new Promise<void>((_r, reject) => {
      svc.sendMessage('x', 'P', 't').subscribe({ next: () => {}, error: reject, complete: () => {} });
    })).rejects.toThrow('neterr');
  });
});
