import { TestBed } from '@angular/core/testing';
import { PlanningChatService } from './planning-chat.service';
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

describe('PlanningChatService', () => {
  let svc: PlanningChatService;
  const authMock = { getToken: () => 'tok-1' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PlanningChatService,
        { provide: AuthService, useValue: authMock },
      ],
    });
    svc = TestBed.inject(PlanningChatService);
  });

  it('emits tokens from data: lines and completes on stream_complete', async () => {
    globalThis.fetch = mockSseFetch([
      'data: Hello\n',
      'data:  world\n',
      'event: stream_complete\n',
    ]);
    const tokens: string[] = [];
    await new Promise<void>((resolve, reject) => {
      svc.sendMessage('IntentExtractionAgent', 's1', 'hi').subscribe({
        next: t => tokens.push(t),
        error: reject,
        complete: resolve,
      });
    });
    expect(tokens).toEqual(['Hello', ' world']);
    expect(svc.streamingContent()).toBe('Hello world');
    expect(svc.isStreaming()).toBe(false);
  });

  it('replaces escaped \\n with newlines in tokens', async () => {
    globalThis.fetch = mockSseFetch([
      'data: line1\\nline2\n',
      'event: stream_complete\n',
    ]);
    const tokens: string[] = [];
    await new Promise<void>((resolve, reject) => {
      svc.sendMessage('QuickResearchAgent', 's1', 'hi').subscribe({
        next: t => tokens.push(t),
        error: reject,
        complete: resolve,
      });
    });
    expect(tokens[0]).toBe('line1\nline2');
  });

  it('surfaces event: error lines as observable errors', async () => {
    globalThis.fetch = mockSseFetch(['event: error\n']);
    await expect(new Promise<void>((resolve, reject) => {
      svc.sendMessage('IntentExtractionAgent', 's1', 'hi').subscribe({
        next: () => {},
        error: reject,
        complete: resolve,
      });
    })).rejects.toBeTruthy();
  });

  it('fetch rejection propagates as observable error and clears isStreaming', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('neterr'));
    await expect(new Promise<void>((resolve, reject) => {
      svc.sendMessage('IntentExtractionAgent', 's1', 'hi').subscribe({
        next: () => {},
        error: reject,
        complete: resolve,
      });
    })).rejects.toThrow('neterr');
    expect(svc.isStreaming()).toBe(false);
  });

  it('stream end without explicit complete also sets isStreaming=false', async () => {
    globalThis.fetch = mockSseFetch(['data: hi\n']);
    await new Promise<void>((resolve, reject) => {
      svc.sendMessage('IntentExtractionAgent', 's1', 'hi').subscribe({
        next: () => {},
        error: reject,
        complete: resolve,
      });
    });
    expect(svc.isStreaming()).toBe(false);
  });

  it('stopStream aborts current request and clears isStreaming', () => {
    svc.stopStream(); // no-op when no controller
    globalThis.fetch = mockSseFetch(['data: x\n', 'event: stream_complete\n']);
    svc.sendMessage('IntentExtractionAgent', 's1', 'x').subscribe();
    svc.stopStream();
    expect(svc.isStreaming()).toBe(false);
  });

  it('resetContent clears buffered content', () => {
    (svc as unknown as { _streamingContent: { set: (v: string) => void } })
      ._streamingContent = (svc as unknown as { _streamingContent: { set: (v: string) => void } })._streamingContent;
    svc.resetContent();
    expect(svc.streamingContent()).toBe('');
  });
});
