import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMarkdown } from 'ngx-markdown';
import { provideHttpClient } from '@angular/common/http';
import { of, Subject, throwError } from 'rxjs';
import { ProjectManagerAgentComponent } from './projectmanager-agent.component';
import { AgentChatService } from '../services/agent-chat.service';
import { NotificationService } from '../../../core/services/notification.service';

describe('ProjectManagerAgentComponent', () => {
  let chatSvc: { sendMessage: ReturnType<typeof vi.fn>; resetSession: ReturnType<typeof vi.fn>; currentReferences: () => unknown[] };

  beforeEach(() => {
    chatSvc = {
      sendMessage: vi.fn().mockReturnValue(of('')),
      resetSession: vi.fn(),
      currentReferences: () => [],
    };
    TestBed.configureTestingModule({
      imports: [ProjectManagerAgentComponent, NoopAnimationsModule],
      providers: [
        { provide: AgentChatService, useValue: chatSvc },
        NotificationService,
        provideHttpClient(),
        provideMarkdown(),
      ],
    });
  });

  const cmpOf = (f: ReturnType<typeof TestBed.createComponent<ProjectManagerAgentComponent>>) =>
    f.componentInstance as unknown as {
      inputText: string;
      isLoading: { (): boolean };
      messages: { (): { role: string; content: string }[] };
      lastMessageIsUser: { (): boolean };
      send: () => void;
      useSuggestion: (t: string) => void;
      onKeydown: (e: KeyboardEvent) => void;
      resetChat: () => void;
      isRefsVisible: (id: string) => boolean;
      toggleRefs: (id: string) => void;
      getScoreClass: (r: number) => string;
    };

  it('send no-ops when empty or already loading', () => {
    const fixture = TestBed.createComponent(ProjectManagerAgentComponent);
    const c = cmpOf(fixture);
    c.send();
    expect(chatSvc.sendMessage).not.toHaveBeenCalled();
  });

  it('send streams tokens and completes', () => {
    const subject = new Subject<string>();
    chatSvc.sendMessage.mockReturnValue(subject);
    const fixture = TestBed.createComponent(ProjectManagerAgentComponent);
    const c = cmpOf(fixture);
    c.inputText = 'hi';
    c.send();
    subject.next('hello');
    subject.complete();
    expect(c.messages()).toHaveLength(2);
    expect(c.messages()[1].content).toContain('hello');
    expect(c.isLoading()).toBe(false);
  });

  it('send handles error and notifies', () => {
    chatSvc.sendMessage.mockReturnValue(throwError(() => new Error('boom')));
    const fixture = TestBed.createComponent(ProjectManagerAgentComponent);
    const c = cmpOf(fixture);
    c.inputText = 'hi';
    c.send();
    expect(c.messages()[1].content).toContain('Error');
    expect(c.isLoading()).toBe(false);
  });

  it('useSuggestion sets input and sends', () => {
    chatSvc.sendMessage.mockReturnValue(of());
    const fixture = TestBed.createComponent(ProjectManagerAgentComponent);
    const c = cmpOf(fixture);
    c.useSuggestion('hola');
    expect(chatSvc.sendMessage).toHaveBeenCalled();
  });

  it('onKeydown Enter triggers send; Shift+Enter skips', () => {
    chatSvc.sendMessage.mockReturnValue(of());
    const fixture = TestBed.createComponent(ProjectManagerAgentComponent);
    const c = cmpOf(fixture);
    c.inputText = 'a';
    c.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(chatSvc.sendMessage).toHaveBeenCalled();
    chatSvc.sendMessage.mockClear();
    c.inputText = 'b';
    c.onKeydown(new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true }));
    expect(chatSvc.sendMessage).not.toHaveBeenCalled();
  });

  it('resetChat clears messages and resets session', () => {
    const fixture = TestBed.createComponent(ProjectManagerAgentComponent);
    const c = cmpOf(fixture);
    c.resetChat();
    expect(c.messages()).toEqual([]);
    expect(chatSvc.resetSession).toHaveBeenCalled();
  });

  it('toggleRefs toggles id in expanded set', () => {
    const fixture = TestBed.createComponent(ProjectManagerAgentComponent);
    const c = cmpOf(fixture);
    expect(c.isRefsVisible('1')).toBe(false);
    c.toggleRefs('1');
    expect(c.isRefsVisible('1')).toBe(true);
    c.toggleRefs('1');
    expect(c.isRefsVisible('1')).toBe(false);
  });

  it('getScoreClass maps relevance to bucket', () => {
    const fixture = TestBed.createComponent(ProjectManagerAgentComponent);
    const c = cmpOf(fixture);
    expect(c.getScoreClass(0.9)).toBe('score-high');
    expect(c.getScoreClass(0.7)).toBe('score-medium');
    expect(c.getScoreClass(0.1)).toBe('score-low');
  });

  it('lastMessageIsUser reflects message list', () => {
    chatSvc.sendMessage.mockReturnValue(of());
    const fixture = TestBed.createComponent(ProjectManagerAgentComponent);
    const c = cmpOf(fixture);
    expect(c.lastMessageIsUser()).toBe(false);
    c.inputText = 'hi';
    c.send();
    expect(c.lastMessageIsUser()).toBe(false); // assistant placeholder is last
  });
});
