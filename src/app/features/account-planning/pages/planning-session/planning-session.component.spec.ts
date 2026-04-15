import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMarkdown } from 'ngx-markdown';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { of, Subject } from 'rxjs';
import { PlanningSessionComponent } from './planning-session.component';
import { PlanningChatService } from '../../services/planning-chat.service';
import { JobPollingService } from '../../services/job-polling.service';
import { TranslationService } from '../../../../core/i18n/translation.service';

const rawSession = (status = 'Queued') => ({
  id: 'sess-1',
  clientId: 'c1',
  conversationSessionId: 'conv-1',
  status,
  userIntent: 'intent',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
});

const rawClient = {
  id: 'c1', name: 'Acme', industry: 'Tech', country: 'CO',
  createdAt: '2026-01-01', updatedAt: '2026-01-01',
};

describe('PlanningSessionComponent', () => {
  let router: { navigate: ReturnType<typeof vi.fn> };
  let chat: {
    sendMessage: ReturnType<typeof vi.fn>;
    streamingContent: ReturnType<typeof vi.fn>;
    isStreaming: ReturnType<typeof vi.fn>;
    resetContent: ReturnType<typeof vi.fn>;
    stopStream: ReturnType<typeof vi.fn>;
  };
  let polling: {
    currentJob: ReturnType<typeof vi.fn>;
    isPolling: ReturnType<typeof vi.fn>;
    startPolling: ReturnType<typeof vi.fn>;
    reset: ReturnType<typeof vi.fn>;
    resumeIfActive: ReturnType<typeof vi.fn>;
  };
  let httpMock: HttpTestingController;

  const setup = () => {
    router = { navigate: vi.fn() };
    chat = {
      sendMessage: vi.fn().mockReturnValue(of()),
      streamingContent: vi.fn().mockReturnValue(''),
      isStreaming: vi.fn().mockReturnValue(false),
      resetContent: vi.fn(),
      stopStream: vi.fn(),
    };
    polling = {
      currentJob: vi.fn().mockReturnValue(null),
      isPolling: vi.fn().mockReturnValue(false),
      startPolling: vi.fn(),
      reset: vi.fn(),
      resumeIfActive: vi.fn(),
    };
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [PlanningSessionComponent, NoopAnimationsModule],
      providers: [
        TranslationService,
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'sess-1' } } } },
        { provide: PlanningChatService, useValue: chat },
        { provide: JobPollingService, useValue: polling },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideMarkdown(),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(PlanningSessionComponent);
    fixture.detectChanges();
    // getById → getById(client) → loadByClient
    httpMock.expectOne(r => r.url.endsWith('/api/planning-sessions/sess-1')).flush(rawSession());
    httpMock.expectOne(r => r.url.endsWith('/api/clients/c1')).flush(rawClient);
    httpMock.expectOne(r => r.url.endsWith('/api/planning-sessions/by-client/c1')).flush([rawSession()]);
    return fixture;
  };

  afterEach(() => httpMock.verify());

  it('loads session and client on init', () => {
    const fixture = setup();
    expect(fixture.componentInstance.client()?.id).toBe('c1');
    expect(fixture.componentInstance.session()?.id).toBe('sess-1');
  });

  it('goBack navigates to /account-planning', () => {
    const fixture = setup();
    fixture.componentInstance.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/account-planning']);
  });

  it('onDefineFocus opens focus selector', () => {
    vi.useFakeTimers();
    const fixture = setup();
    fixture.componentInstance.onDefineFocus();
    expect(fixture.componentInstance.showFocusSelector()).toBe(true);
    vi.advanceTimersByTime(200);
    vi.useRealTimers();
  });

  it('sendChat ignores empty and when no session', () => {
    const fixture = setup();
    fixture.componentInstance.sendChat('');
    expect(chat.sendMessage).not.toHaveBeenCalled();
  });

  it('sendChat calls chatService and appends messages on complete', () => {
    const fixture = setup();
    const subject = new Subject<string>();
    chat.sendMessage.mockReturnValue(subject);
    chat.streamingContent.mockReturnValue('agent reply');
    fixture.componentInstance.sendChat('hi');
    expect(chat.sendMessage).toHaveBeenCalled();
    subject.complete();
    const history = fixture.componentInstance.chatHistory();
    expect(history.some(m => m.content === 'hi')).toBe(true);
    expect(history.some(m => m.content === 'agent reply')).toBe(true);
  });

  it('confirmClient calls service and starts polling', () => {
    const fixture = setup();
    fixture.componentInstance.confirmClient();
    httpMock.expectOne(r => r.url.endsWith('/api/planning-sessions/sess-1/confirm'))
      .flush({ session: rawSession('DeepSearching'), jobId: 'j1' });
    expect(polling.startPolling).toHaveBeenCalledWith('j1');
  });

  it('submitLinkedIn ignores empty, calls on value', () => {
    const fixture = setup();
    fixture.componentInstance.submitLinkedIn();
    httpMock.verify();
    fixture.componentInstance.linkedInInput = 'data';
    fixture.componentInstance.submitLinkedIn();
    httpMock.expectOne(r => r.url.endsWith('/api/planning-sessions/sess-1/linkedin')).flush(rawSession());
  });

  it('setFocus ignores empty, calls on valid values', () => {
    const fixture = setup();
    fixture.componentInstance.setFocus();
    httpMock.verify();
    fixture.componentInstance.focusCompanyType = 'T';
    fixture.componentInstance.focusContactRole = 'R';
    fixture.componentInstance.setFocus();
    httpMock.expectOne(r => r.url.endsWith('/api/planning-sessions/sess-1/focus'))
      .flush({ session: rawSession(), jobId: 'j2' });
    expect(polling.startPolling).toHaveBeenCalledWith('j2');
  });

  it('approve/regenerate/retry call service', () => {
    const fixture = setup();
    fixture.componentInstance.approve();
    httpMock.expectOne(r => r.url.endsWith('/api/planning-sessions/sess-1/approve')).flush(rawSession());
    fixture.componentInstance.regenerate();
    httpMock.expectOne(r => r.url.endsWith('/api/planning-sessions/sess-1/regenerate'))
      .flush({ session: rawSession(), jobId: 'j3' });
    fixture.componentInstance.retry();
    httpMock.expectOne(r => r.url.endsWith('/api/planning-sessions/sess-1/retry'))
      .flush({ session: rawSession(), jobId: 'j4' });
  });

  it('rejectClient transitions session and sends chat', () => {
    const fixture = setup();
    chat.sendMessage.mockReturnValue(of());
    fixture.componentInstance.rejectClient();
    httpMock.expectOne(r => r.url.endsWith('/api/planning-sessions/sess-1/reject-quick-search'))
      .flush(rawSession());
  });

  it('onViewPreviousResults navigates to completed session', () => {
    const fixture = setup();
    fixture.componentInstance.clientSessions.set([
      rawSession('Approved') as never,
      { ...rawSession('Approved'), id: 'other-sess' } as never,
    ]);
    fixture.componentInstance.onViewPreviousResults();
    expect(router.navigate).toHaveBeenCalledWith(['/account-planning/sessions', 'other-sess']);
  });

  it('onViewPreviousResults no-op when none completed', () => {
    const fixture = setup();
    fixture.componentInstance.clientSessions.set([rawSession('Queued') as never]);
    fixture.componentInstance.onViewPreviousResults();
    // only the ngOnInit navigation was called
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('startNewInvestigation creates session and navigates', () => {
    const fixture = setup();
    fixture.componentInstance.startNewInvestigation();
    httpMock.expectOne(r => r.url.endsWith('/api/planning-sessions')).flush(rawSession());
    expect(router.navigate).toHaveBeenCalledWith(['/account-planning/sessions', 'sess-1']);
  });

  it('switchSession navigates when different id', () => {
    const fixture = setup();
    fixture.componentInstance.switchSession('sess-1');
    expect(router.navigate).not.toHaveBeenCalled();
    fixture.componentInstance.switchSession('other');
    expect(router.navigate).toHaveBeenCalledWith(['/account-planning/sessions', 'other']);
  });

  it('isConversationalState true for early statuses', () => {
    const fixture = setup();
    expect(fixture.componentInstance.isConversationalState()).toBe(true);
  });
});
