import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ClientListComponent, StripProtocolPipe } from './client-list.component';
import { TranslationService } from '../../../../core/i18n/translation.service';

describe('ClientListComponent', () => {
  let router: { navigate: ReturnType<typeof vi.fn> };
  let httpMock: HttpTestingController;
  let dialog: { open: ReturnType<typeof vi.fn> };
  let dialogRef: { afterClosed: ReturnType<typeof vi.fn> };

  const flushInit = () => {
    httpMock.expectOne(r => r.url.endsWith('/api/clients')).flush([]);
    httpMock.expectOne(r => r.url.endsWith('/api/planning-sessions/my')).flush([]);
  };

  beforeEach(() => {
    router = { navigate: vi.fn() };
    dialogRef = { afterClosed: vi.fn().mockReturnValue(of(false)) };
    dialog = { open: vi.fn().mockReturnValue(dialogRef as unknown as MatDialogRef<unknown>) };
    TestBed.configureTestingModule({
      imports: [ClientListComponent, NoopAnimationsModule],
      providers: [
        TranslationService,
        { provide: Router, useValue: router },
        { provide: MatDialog, useValue: dialog },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads clients and sessions on init, builds latestSessions map', () => {
    const fixture = TestBed.createComponent(ClientListComponent);
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.endsWith('/api/clients')).flush([
      { id: 'c1', name: 'Acme', industry: 'Tech', country: 'CO', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
    ]);
    httpMock.expectOne(r => r.url.endsWith('/api/planning-sessions/my')).flush([
      { id: 's1', clientId: 'c1', status: 'Approved', createdAt: '2026-01-01', updatedAt: '2026-01-02' },
      { id: 's2', clientId: 'c1', status: 'Queued', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
    ]);
    // Latest session (updatedAt max) wins
    expect(fixture.componentInstance.latestSessions()['c1'].id).toBe('s1');
  });

  it('filteredClients filters by name/industry/country', () => {
    const fixture = TestBed.createComponent(ClientListComponent);
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.endsWith('/api/clients')).flush([
      { id: '1', name: 'Alpha', industry: 'Tech', country: 'CO', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
      { id: '2', name: 'Beta', industry: 'Retail', country: 'US', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
    ]);
    httpMock.expectOne(r => r.url.endsWith('/api/planning-sessions/my')).flush([]);
    fixture.componentInstance.searchTerm.set('retail');
    expect(fixture.componentInstance.filteredClients()).toHaveLength(1);
    fixture.componentInstance.searchTerm.set('');
    expect(fixture.componentInstance.filteredClients()).toHaveLength(2);
  });

  it('getClientStatus returns right key per session status', () => {
    const fixture = TestBed.createComponent(ClientListComponent);
    fixture.detectChanges();
    flushInit();
    expect(fixture.componentInstance.getClientStatus('x').key).toBe('notInvestigated');
    fixture.componentInstance.latestSessions.set({
      c1: { id: 's', clientId: 'c1', status: 'Approved', createdAt: new Date(), updatedAt: new Date() } as never,
    });
    expect(fixture.componentInstance.getClientStatus('c1').key).toBe('approved');
    fixture.componentInstance.latestSessions.set({
      c1: { id: 's', clientId: 'c1', status: 'Failed', createdAt: new Date(), updatedAt: new Date() } as never,
    });
    expect(fixture.componentInstance.getClientStatus('c1').key).toBe('error');
    fixture.componentInstance.latestSessions.set({
      c1: { id: 's', clientId: 'c1', status: 'DeepSearching', createdAt: new Date(), updatedAt: new Date() } as never,
    });
    expect(fixture.componentInstance.getClientStatus('c1').key).toBe('inProgress');
    fixture.componentInstance.latestSessions.set({
      c1: { id: 's', clientId: 'c1', status: 'AwaitingReview', createdAt: new Date(), updatedAt: new Date() } as never,
    });
    expect(fixture.componentInstance.getClientStatus('c1').key).toBe('inProgress');
  });

  it('createClient/editClient navigate', () => {
    const fixture = TestBed.createComponent(ClientListComponent);
    fixture.detectChanges();
    flushInit();
    fixture.componentInstance.createClient();
    expect(router.navigate).toHaveBeenCalledWith(['/account-planning/clients/new']);
    fixture.componentInstance.editClient({ id: '1' } as never);
    expect(router.navigate).toHaveBeenCalledWith(['/account-planning/clients', '1', 'edit']);
  });

  it('startPlanning resumes active session or creates new', () => {
    const fixture = TestBed.createComponent(ClientListComponent);
    fixture.detectChanges();
    flushInit();
    fixture.componentInstance.latestSessions.set({
      c1: { id: 's1', clientId: 'c1', status: 'Queued', createdAt: new Date(), updatedAt: new Date() } as never,
    });
    fixture.componentInstance.startPlanning({ id: 'c1' } as never);
    expect(router.navigate).toHaveBeenCalledWith(['/account-planning/sessions', 's1']);

    fixture.componentInstance.startPlanning({ id: 'c2' } as never);
    httpMock.expectOne(r => r.url.endsWith('/api/planning-sessions')).flush({
      id: 'new', clientId: 'c2', status: 'Queued', createdAt: '2026-01-01', updatedAt: '2026-01-01',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/account-planning/sessions', 'new']);
  });

  it('deleteClient opens dialog and deletes on confirm', () => {
    const fixture = TestBed.createComponent(ClientListComponent);
    fixture.detectChanges();
    flushInit();
    dialogRef.afterClosed.mockReturnValue(of(true));
    fixture.componentInstance.deleteClient({ id: 'c1', name: 'Acme' } as never);
    expect(dialog.open).toHaveBeenCalled();
    httpMock.expectOne(r => r.url.endsWith('/api/clients/c1')).flush(null);
  });

  it('deleteClient cancels on no confirm', () => {
    const fixture = TestBed.createComponent(ClientListComponent);
    fixture.detectChanges();
    flushInit();
    fixture.componentInstance.deleteClient({ id: 'c1', name: 'Acme' } as never);
    httpMock.verify();
  });

  it('getAvatarColor is deterministic', () => {
    const fixture = TestBed.createComponent(ClientListComponent);
    fixture.detectChanges();
    flushInit();
    expect(fixture.componentInstance.getAvatarColor('Acme')).toBe(fixture.componentInstance.getAvatarColor('Acme'));
  });

  it('StripProtocolPipe strips protocol and trailing slash', () => {
    const pipe = new StripProtocolPipe();
    expect(pipe.transform('https://www.acme.com/')).toBe('acme.com');
    expect(pipe.transform('http://acme.com')).toBe('acme.com');
  });
});
