import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { GroupsPageComponent } from './groups-page.component';
import { SecurityGroup } from '../../services/security.service';
import { environment } from '../../../../../environments/environment';

const url = (p: string) => `${environment.apiUrl}${p}`;

const makeGroup = (overrides: Partial<SecurityGroup> = {}): SecurityGroup => ({
  id: 'g1',
  name: 'Admin',
  description: 'Full access',
  isActive: true,
  createdAt: '2026-01-01T00:00:00Z',
  modules: ['home', 'security'],
  ...overrides,
});

const modulesList = [
  { key: 'home', label: 'Inicio', icon: 'home' },
  { key: 'security', label: 'Seguridad', icon: 'shield' },
  { key: 'account-planning', label: 'Account Planning', icon: 'business_center' },
];

describe('GroupsPageComponent', () => {
  let httpMock: HttpTestingController;

  const flushInit = (groups: SecurityGroup[] = [], modules = modulesList) => {
    httpMock.expectOne(r => r.url.endsWith('/api/security/groups')).flush(groups);
    httpMock.expectOne(r => r.url.endsWith('/api/security/modules')).flush(modules);
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GroupsPageComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads groups and modules on init', () => {
    const fixture = TestBed.createComponent(GroupsPageComponent);
    fixture.detectChanges();
    flushInit([makeGroup()]);
    expect(fixture.componentInstance.groups()).toHaveLength(1);
    expect(fixture.componentInstance.availableModules()).toHaveLength(3);
  });

  it('createGroup sends POST and resets form', () => {
    const fixture = TestBed.createComponent(GroupsPageComponent);
    fixture.detectChanges();
    flushInit();
    fixture.componentInstance.newName = 'Comercial';
    fixture.componentInstance.newDesc = 'Team comercial';
    fixture.componentInstance.newModules = new Set(['home', 'account-planning']);

    fixture.componentInstance.createGroup();

    const req = httpMock.expectOne(r => r.url.endsWith('/api/security/groups'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body.name).toBe('Comercial');
    expect(req.request.body.modules).toContain('home');
    req.flush(makeGroup({ id: 'g2', name: 'Comercial' }));

    expect(fixture.componentInstance.newName).toBe('');
    expect(fixture.componentInstance.newDesc).toBe('');
  });

  it('createGroup does nothing with empty name', () => {
    const fixture = TestBed.createComponent(GroupsPageComponent);
    fixture.detectChanges();
    flushInit();
    fixture.componentInstance.newName = '   ';
    fixture.componentInstance.createGroup();
    httpMock.verify();
  });

  it('toggleNewModule adds and removes module', () => {
    const fixture = TestBed.createComponent(GroupsPageComponent);
    fixture.detectChanges();
    flushInit();
    expect(fixture.componentInstance.newModules.has('home')).toBe(true);
    fixture.componentInstance.toggleNewModule('home');
    expect(fixture.componentInstance.newModules.has('home')).toBe(false);
    fixture.componentInstance.toggleNewModule('home');
    expect(fixture.componentInstance.newModules.has('home')).toBe(true);
  });

  it('startEdit populates edit fields', () => {
    const fixture = TestBed.createComponent(GroupsPageComponent);
    fixture.detectChanges();
    flushInit([makeGroup()]);
    const group = makeGroup();
    fixture.componentInstance.startEdit(group);
    expect(fixture.componentInstance.editingId()).toBe('g1');
    expect(fixture.componentInstance.editName).toBe('Admin');
    expect(fixture.componentInstance.editDesc).toBe('Full access');
    expect(fixture.componentInstance.editActive).toBe(true);
    expect(fixture.componentInstance.editModules.has('home')).toBe(true);
    expect(fixture.componentInstance.editModules.has('security')).toBe(true);
  });

  it('cancelEdit clears editingId', () => {
    const fixture = TestBed.createComponent(GroupsPageComponent);
    fixture.detectChanges();
    flushInit();
    fixture.componentInstance.editingId.set('g1');
    fixture.componentInstance.cancelEdit();
    expect(fixture.componentInstance.editingId()).toBeNull();
  });

  it('saveEdit sends PUT and clears editingId', () => {
    const fixture = TestBed.createComponent(GroupsPageComponent);
    fixture.detectChanges();
    flushInit([makeGroup()]);
    const group = makeGroup();
    fixture.componentInstance.startEdit(group);
    fixture.componentInstance.editName = 'Updated';

    fixture.componentInstance.saveEdit(group);

    const req = httpMock.expectOne(r => r.url.endsWith('/api/security/groups/g1'));
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.name).toBe('Updated');
    req.flush(makeGroup({ name: 'Updated' }));

    expect(fixture.componentInstance.editingId()).toBeNull();
  });

  it('toggleEditModule adds and removes module', () => {
    const fixture = TestBed.createComponent(GroupsPageComponent);
    fixture.detectChanges();
    flushInit();
    fixture.componentInstance.editModules = new Set(['home']);
    fixture.componentInstance.toggleEditModule('security');
    expect(fixture.componentInstance.editModules.has('security')).toBe(true);
    fixture.componentInstance.toggleEditModule('security');
    expect(fixture.componentInstance.editModules.has('security')).toBe(false);
  });

  it('deleteGroup sends DELETE', () => {
    const fixture = TestBed.createComponent(GroupsPageComponent);
    fixture.detectChanges();
    flushInit([makeGroup()]);
    fixture.componentInstance.deleteGroup('g1');
    const req = httpMock.expectOne(r => r.url.endsWith('/api/security/groups/g1'));
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getModuleLabel returns label for known key', () => {
    const fixture = TestBed.createComponent(GroupsPageComponent);
    fixture.detectChanges();
    flushInit();
    expect(fixture.componentInstance.getModuleLabel('home')).toBe('Inicio');
  });

  it('getModuleLabel returns key for unknown module', () => {
    const fixture = TestBed.createComponent(GroupsPageComponent);
    fixture.detectChanges();
    flushInit();
    expect(fixture.componentInstance.getModuleLabel('unknown')).toBe('unknown');
  });

  it('getModuleIcon returns icon for known key', () => {
    const fixture = TestBed.createComponent(GroupsPageComponent);
    fixture.detectChanges();
    flushInit();
    expect(fixture.componentInstance.getModuleIcon('security')).toBe('shield');
  });

  it('getModuleIcon returns extension for unknown module', () => {
    const fixture = TestBed.createComponent(GroupsPageComponent);
    fixture.detectChanges();
    flushInit();
    expect(fixture.componentInstance.getModuleIcon('unknown')).toBe('extension');
  });
});
