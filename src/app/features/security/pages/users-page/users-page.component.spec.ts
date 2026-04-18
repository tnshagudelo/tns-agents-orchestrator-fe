import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { UsersPageComponent } from './users-page.component';
import { AppUserInfo } from '../../services/security.service';
import { environment } from '../../../../../environments/environment';

const url = (p: string) => `${environment.apiUrl}${p}`;

const makeUser = (overrides: Partial<AppUserInfo> = {}): AppUserInfo => ({
  id: 'u1',
  gitHubId: '123',
  username: 'testuser',
  email: 'test@example.com',
  avatarUrl: null,
  groupId: 'g1',
  groupName: 'Admin',
  status: 'active',
  createdAt: '2026-01-01T00:00:00Z',
  approvedByUserId: null,
  approvedAt: null,
  modules: [],
  ...overrides,
});

describe('UsersPageComponent', () => {
  let httpMock: HttpTestingController;

  const flushInit = (users: AppUserInfo[] = [], groups: unknown[] = []) => {
    httpMock.expectOne(r => r.url.endsWith('/api/security/users')).flush(users);
    httpMock.expectOne(r => r.url.endsWith('/api/security/groups')).flush(groups);
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [UsersPageComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads users and groups on init', () => {
    const fixture = TestBed.createComponent(UsersPageComponent);
    fixture.detectChanges();
    flushInit([makeUser()], [{ id: 'g1', name: 'Admin', isActive: true, modules: [] }]);
    expect(fixture.componentInstance.allUsers()).toHaveLength(1);
    expect(fixture.componentInstance.allGroups()).toHaveLength(1);
  });

  it('pendingUsers filters only pending status', () => {
    const fixture = TestBed.createComponent(UsersPageComponent);
    fixture.detectChanges();
    flushInit([
      makeUser({ id: 'u1', status: 'pending' }),
      makeUser({ id: 'u2', status: 'active' }),
      makeUser({ id: 'u3', status: 'rejected' }),
    ]);
    expect(fixture.componentInstance.pendingUsers()).toHaveLength(1);
    expect(fixture.componentInstance.pendingUsers()[0].id).toBe('u1');
  });

  it('activeUsers filters only active status', () => {
    const fixture = TestBed.createComponent(UsersPageComponent);
    fixture.detectChanges();
    flushInit([
      makeUser({ id: 'u1', status: 'active' }),
      makeUser({ id: 'u2', status: 'inactive' }),
    ]);
    expect(fixture.componentInstance.activeUsers()).toHaveLength(1);
    expect(fixture.componentInstance.activeUsers()[0].id).toBe('u1');
  });

  it('inactiveUsers filters only inactive status', () => {
    const fixture = TestBed.createComponent(UsersPageComponent);
    fixture.detectChanges();
    flushInit([
      makeUser({ id: 'u1', status: 'inactive' }),
      makeUser({ id: 'u2', status: 'active' }),
    ]);
    expect(fixture.componentInstance.inactiveUsers()).toHaveLength(1);
    expect(fixture.componentInstance.inactiveUsers()[0].id).toBe('u1');
  });

  it('rejectedUsers filters only rejected status', () => {
    const fixture = TestBed.createComponent(UsersPageComponent);
    fixture.detectChanges();
    flushInit([
      makeUser({ id: 'u1', status: 'rejected' }),
      makeUser({ id: 'u2', status: 'active' }),
    ]);
    expect(fixture.componentInstance.rejectedUsers()).toHaveLength(1);
    expect(fixture.componentInstance.rejectedUsers()[0].id).toBe('u1');
  });

  it('activeGroups filters only active groups', () => {
    const fixture = TestBed.createComponent(UsersPageComponent);
    fixture.detectChanges();
    flushInit([], [
      { id: 'g1', name: 'Admin', isActive: true, modules: [] },
      { id: 'g2', name: 'Disabled', isActive: false, modules: [] },
    ]);
    expect(fixture.componentInstance.activeGroups()).toHaveLength(1);
    expect(fixture.componentInstance.activeGroups()[0].name).toBe('Admin');
  });

  it('approve does nothing without a selected group', () => {
    const fixture = TestBed.createComponent(UsersPageComponent);
    fixture.detectChanges();
    flushInit([makeUser({ id: 'u1', status: 'pending' })]);
    fixture.componentInstance.approve(makeUser({ id: 'u1', status: 'pending' }));
    httpMock.verify();
  });

  it('approve sends POST with groupId', () => {
    const fixture = TestBed.createComponent(UsersPageComponent);
    fixture.detectChanges();
    flushInit([makeUser({ id: 'u1', status: 'pending' })]);
    fixture.componentInstance.approveGroupId['u1'] = 'g1';
    fixture.componentInstance.approve(makeUser({ id: 'u1', status: 'pending' }));
    const req = httpMock.expectOne(r => r.url.endsWith('/api/security/users/u1/approve'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ groupId: 'g1' });
    req.flush(makeUser({ id: 'u1', status: 'active' }));
  });

  it('reject sends POST', () => {
    const fixture = TestBed.createComponent(UsersPageComponent);
    fixture.detectChanges();
    flushInit();
    fixture.componentInstance.reject('u1');
    const req = httpMock.expectOne(r => r.url.endsWith('/api/security/users/u1/reject'));
    expect(req.request.method).toBe('POST');
    req.flush(makeUser({ id: 'u1', status: 'rejected' }));
  });

  it('deactivate sends POST', () => {
    const fixture = TestBed.createComponent(UsersPageComponent);
    fixture.detectChanges();
    flushInit();
    fixture.componentInstance.deactivate('u1');
    const req = httpMock.expectOne(r => r.url.endsWith('/api/security/users/u1/deactivate'));
    expect(req.request.method).toBe('POST');
    req.flush(makeUser({ id: 'u1', status: 'inactive' }));
  });

  it('activate sends POST', () => {
    const fixture = TestBed.createComponent(UsersPageComponent);
    fixture.detectChanges();
    flushInit();
    fixture.componentInstance.activate('u1');
    const req = httpMock.expectOne(r => r.url.endsWith('/api/security/users/u1/activate'));
    expect(req.request.method).toBe('POST');
    req.flush(makeUser({ id: 'u1', status: 'active' }));
  });

  it('removeUser sends DELETE', () => {
    const fixture = TestBed.createComponent(UsersPageComponent);
    fixture.detectChanges();
    flushInit();
    fixture.componentInstance.removeUser('u1');
    const req = httpMock.expectOne(r => r.url.endsWith('/api/security/users/u1'));
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('changeGroup sends PUT with new groupId', () => {
    const fixture = TestBed.createComponent(UsersPageComponent);
    fixture.detectChanges();
    flushInit();
    fixture.componentInstance.changeGroup('u1', 'g2');
    const req = httpMock.expectOne(r => r.url.endsWith('/api/security/users/u1/group'));
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ groupId: 'g2' });
    req.flush(makeUser({ id: 'u1', groupId: 'g2' }));
  });
});
