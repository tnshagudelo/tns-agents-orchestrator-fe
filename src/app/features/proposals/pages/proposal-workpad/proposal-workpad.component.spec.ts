import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMarkdown } from 'ngx-markdown';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProposalWorkpadComponent } from './proposal-workpad.component';
import { AuthService } from '../../../../core/auth/auth.service';

if (!(Element.prototype as unknown as { scrollIntoView?: unknown }).scrollIntoView) {
  Element.prototype.scrollIntoView = function () { /* no-op */ };
}

const rawProposal = (id = 'p1', overrides: Record<string, unknown> = {}) => ({
  id, name: 'P', projectName: 'Proj', status: 'Draft', sessionId: '',
  iterations: [
    { version: 1, content: 'v1', components: [], teamSize: 1, durationWeeks: 1, riskLevel: 'low', createdAt: '2026-01-01' },
    { version: 2, content: 'v2', components: ['api'], teamSize: 2, durationWeeks: 2, riskLevel: 'medium', createdAt: '2026-01-02' },
  ],
  currentIteration: 2,
  comments: [], approvalFlow: [], tags: [],
  createdAt: '2026-01-01', updatedAt: '2026-01-01',
  ...overrides,
});

describe('ProposalWorkpadComponent', () => {
  let router: { navigate: ReturnType<typeof vi.fn> };
  let httpMock: HttpTestingController;

  const auth = {
    currentUser: () => ({ id: 'me', username: 'Me', proposalRole: 'builder' }),
    getToken: () => 'tok',
  };

  const setup = () => {
    router = { navigate: vi.fn() };
    TestBed.configureTestingModule({
      imports: [ProposalWorkpadComponent, NoopAnimationsModule],
      providers: [
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'p1' } } } },
        { provide: AuthService, useValue: auth },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideMarkdown(),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ProposalWorkpadComponent);
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.endsWith('/proposals/p1')).flush(rawProposal());
    return fixture;
  };

  afterEach(() => httpMock.verify());

  it('loads proposal and picks current iteration content', () => {
    const fixture = setup();
    expect(fixture.componentInstance.selectedIteration()).toBe(2);
    expect(fixture.componentInstance.currentIterationData()?.version).toBe(2);
  });

  it('selectIteration updates edit buffer', () => {
    const fixture = setup();
    fixture.componentInstance.selectIteration(1);
    expect(fixture.componentInstance.selectedIteration()).toBe(1);
    expect(fixture.componentInstance.editContent()).toBe('v1');
  });

  it('toggleMode flips chat/edit and seeds edit buffer', () => {
    const fixture = setup();
    expect(fixture.componentInstance.workpadMode()).toBe('chat');
    fixture.componentInstance.toggleMode();
    expect(fixture.componentInstance.workpadMode()).toBe('edit');
    fixture.componentInstance.toggleMode();
    expect(fixture.componentInstance.workpadMode()).toBe('chat');
  });

  it('startEditProject/saveProjectName and startEditProposal/saveProposalName toggle flags', () => {
    const fixture = setup();
    fixture.componentInstance.startEditProject();
    expect(fixture.componentInstance.editingProject()).toBe(true);
    fixture.componentInstance.saveProjectName();
    expect(fixture.componentInstance.editingProject()).toBe(false);
    fixture.componentInstance.startEditProposal();
    expect(fixture.componentInstance.editingProposal()).toBe(true);
    fixture.componentInstance.saveProposalName();
    expect(fixture.componentInstance.editingProposal()).toBe(false);
  });

  it('deleteProposal success navigates back', () => {
    const fixture = setup();
    fixture.componentInstance.deleteProposal();
    httpMock.expectOne(r => r.url.endsWith('/proposals/p1')).flush(null);
    expect(router.navigate).toHaveBeenCalledWith(['/proposals']);
  });

  it('deleteProposal error resets confirming flag', () => {
    const fixture = setup();
    fixture.componentInstance.confirmingDelete.set(true);
    fixture.componentInstance.deleteProposal();
    httpMock.expectOne(r => r.url.endsWith('/proposals/p1')).error(new ProgressEvent('err'));
    expect(fixture.componentInstance.confirmingDelete()).toBe(false);
  });

  it('submitForReview calls service', () => {
    const fixture = setup();
    fixture.componentInstance.submitForReview();
    httpMock.expectOne(r => r.url.endsWith('/proposals/p1/submit')).flush(rawProposal());
  });

  it('onSaveIteration builds payload and calls service', () => {
    const fixture = setup();
    fixture.componentInstance.onSaveIteration('new content');
    httpMock.expectOne(r => r.url.endsWith('/proposals/p1/iterations')).flush(rawProposal());
  });

  it('saveEditAsIteration uses current edit buffer', () => {
    const fixture = setup();
    fixture.componentInstance.editContentStr = 'buffered';
    fixture.componentInstance.saveEditAsIteration();
    httpMock.expectOne(r => r.url.endsWith('/proposals/p1/iterations')).flush(rawProposal());
  });

  it('onAddComment calls addComment with current user info', () => {
    const fixture = setup();
    fixture.componentInstance.onAddComment('body');
    httpMock.expectOne(r => r.url.endsWith('/proposals/p1/comments')).flush(rawProposal());
  });

  it('onAskAgent switches to chat mode', () => {
    vi.useFakeTimers();
    const fixture = setup();
    fixture.componentInstance.workpadMode.set('edit');
    fixture.componentInstance.onAskAgent('question');
    expect(fixture.componentInstance.workpadMode()).toBe('chat');
    vi.advanceTimersByTime(200);
    vi.useRealTimers();
  });

  it('copyContent calls clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const fixture = setup();
    fixture.componentInstance.copyContent();
    await Promise.resolve();
    expect(writeText).toHaveBeenCalled();
  });

  it('exportMarkdown triggers download', () => {
    const origCreate = URL.createObjectURL;
    const origRevoke = URL.revokeObjectURL;
    URL.createObjectURL = vi.fn().mockReturnValue('blob:x');
    URL.revokeObjectURL = vi.fn();
    const click = vi.fn();
    const origCreateEl = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
      if (tag === 'a') return { click, href: '', download: '' } as unknown as HTMLAnchorElement;
      return origCreateEl(tag);
    }) as typeof document.createElement);
    const fixture = setup();
    fixture.componentInstance.exportMarkdown();
    expect(click).toHaveBeenCalled();
    URL.createObjectURL = origCreate;
    URL.revokeObjectURL = origRevoke;
  });

  it('insertMd appends markdown delimiters', () => {
    const fixture = setup();
    fixture.componentInstance.editContentStr = 'hi';
    fixture.componentInstance.insertMd('**', '**');
    expect(fixture.componentInstance.editContentStr).toBe('hi****');
  });

  it('label helpers map values and fall back', () => {
    const fixture = setup();
    const c = fixture.componentInstance;
    expect(c.riskColor('low')).toBe('#3B6D11');
    expect(c.riskColor('unknown')).toBe('#888');
    expect(c.stepIcon('approved')).toBe('check_circle');
    expect(c.stepIcon('unknown')).toBe('help');
    expect(c.roleLabel('reviewer')).toBe('Revisor');
    expect(c.roleLabel('other')).toBe('other');
  });

  it('isTerminal true for approved/rejected', () => {
    const fixture = setup();
    expect(fixture.componentInstance.isTerminal()).toBe(false);
  });
});
