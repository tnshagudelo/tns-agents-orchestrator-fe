import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMarkdown } from 'ngx-markdown';
import { provideHttpClient } from '@angular/common/http';
import { Subject, throwError, of } from 'rxjs';
import { ProposalChatPanelComponent } from './proposal-chat-panel.component';
import { ProposalChatService } from '../../services/proposal-chat.service';
import { NotificationService } from '../../../../core/services/notification.service';

// jsdom polyfill — the component's ngAfterViewChecked calls scrollIntoView
if (!(Element.prototype as unknown as { scrollIntoView?: unknown }).scrollIntoView) {
  Element.prototype.scrollIntoView = function () { /* no-op */ };
}

function setupTest(chatSvc: Record<string, unknown>) {
  TestBed.configureTestingModule({
    imports: [ProposalChatPanelComponent, NoopAnimationsModule],
    providers: [
      { provide: ProposalChatService, useValue: chatSvc },
      NotificationService,
      provideHttpClient(),
      provideMarkdown(),
    ],
  });
  const fixture = TestBed.createComponent(ProposalChatPanelComponent);
  fixture.componentRef.setInput('proposalId', 'p1');
  fixture.componentRef.setInput('projectName', 'Proj');
  return fixture;
}

type Cmp = {
  inputText: string;
  messages: { (): { role: string; content: string }[] };
  send: () => void;
  onKey: (e: KeyboardEvent) => void;
  useSuggestion: (t: string) => void;
  saveAsIteration: () => void;
  saveIteration: { subscribe: (fn: (v: string) => void) => unknown };
  isRefsVisible: (id: string) => boolean;
  toggleRefs: (id: string) => void;
  getScoreClass: (r: number) => string;
  addExternalMessage: (t: string) => void;
  lastIsUser: () => boolean;
};

describe('ProposalChatPanelComponent', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('send no-ops when empty or streaming', () => {
    const sendMessage = vi.fn().mockReturnValue(of());
    const fixture = setupTest({
      isStreaming: () => false,
      sendMessage,
      currentReferences: () => [],
    });
    (fixture.componentInstance as unknown as Cmp).send();
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('send streams tokens, completes, emits saveIteration-ready state', () => {
    const subject = new Subject<string>();
    const fixture = setupTest({
      isStreaming: () => false,
      sendMessage: vi.fn().mockReturnValue(subject),
      currentReferences: () => [],
    });
    const c = fixture.componentInstance as unknown as Cmp;
    c.inputText = 'hi';
    c.send();
    subject.next('hello');
    subject.complete();
    expect(c.messages()[1].content).toContain('hello');
  });

  it('send error path records error', () => {
    const fixture = setupTest({
      isStreaming: () => false,
      sendMessage: vi.fn().mockReturnValue(throwError(() => new Error('x'))),
      currentReferences: () => [],
    });
    const c = fixture.componentInstance as unknown as Cmp;
    c.inputText = 'hi';
    c.send();
    expect(c.messages()[1].content).toContain('Error');
  });

  it('saveAsIteration emits last completed content', () => {
    const subject = new Subject<string>();
    const fixture = setupTest({
      isStreaming: () => false,
      sendMessage: vi.fn().mockReturnValue(subject),
      currentReferences: () => [],
    });
    const c = fixture.componentInstance as unknown as Cmp;
    const received: string[] = [];
    c.saveIteration.subscribe((v: string) => received.push(v));
    c.inputText = 'hi';
    c.send();
    subject.next('output');
    subject.complete();
    c.saveAsIteration();
    expect(received).toEqual(['output']);
  });

  it('onKey Enter sends, Shift+Enter does not', () => {
    const sendMessage = vi.fn().mockReturnValue(of());
    const fixture = setupTest({
      isStreaming: () => false,
      sendMessage,
      currentReferences: () => [],
    });
    const c = fixture.componentInstance as unknown as Cmp;
    c.inputText = 'a';
    c.onKey(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(sendMessage).toHaveBeenCalled();
    sendMessage.mockClear();
    c.inputText = 'b';
    c.onKey(new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true }));
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('useSuggestion / addExternalMessage set input and call send', () => {
    const sendMessage = vi.fn().mockReturnValue(of());
    const fixture = setupTest({
      isStreaming: () => false,
      sendMessage,
      currentReferences: () => [],
    });
    const c = fixture.componentInstance as unknown as Cmp;
    c.useSuggestion('s');
    c.addExternalMessage('e');
    expect(sendMessage).toHaveBeenCalledTimes(2);
  });

  it('toggleRefs and getScoreClass behave correctly', () => {
    const fixture = setupTest({
      isStreaming: () => false,
      sendMessage: vi.fn().mockReturnValue(of()),
      currentReferences: () => [],
    });
    const c = fixture.componentInstance as unknown as Cmp;
    c.toggleRefs('r1');
    expect(c.isRefsVisible('r1')).toBe(true);
    c.toggleRefs('r1');
    expect(c.isRefsVisible('r1')).toBe(false);
    expect(c.getScoreClass(0.9)).toBe('score-high');
    expect(c.getScoreClass(0.7)).toBe('score-medium');
    expect(c.getScoreClass(0.1)).toBe('score-low');
  });

  it('handles corrupted persisted messages gracefully', () => {
    sessionStorage.setItem('chat_msgs_p1', 'not json again');
    const fixture = setupTest({
      isStreaming: () => false,
      sendMessage: vi.fn().mockReturnValue(of()),
      currentReferences: () => [],
    });
    const c = fixture.componentInstance as unknown as Cmp;
    expect(c.messages()).toEqual([]);
  });

  it('handles corrupted sessionStorage gracefully', () => {
    sessionStorage.setItem('chat_msgs_p1', 'not json');
    const fixture = setupTest({
      isStreaming: () => false,
      sendMessage: vi.fn().mockReturnValue(of()),
      currentReferences: () => [],
    });
    const c = fixture.componentInstance as unknown as Cmp;
    expect(c.messages()).toEqual([]);
  });
});
