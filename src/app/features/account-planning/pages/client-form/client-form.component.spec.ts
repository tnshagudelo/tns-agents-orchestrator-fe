import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ClientFormComponent } from './client-form.component';
import { TranslationService } from '../../../../core/i18n/translation.service';

describe('ClientFormComponent', () => {
  let router: { navigate: ReturnType<typeof vi.fn> };
  let httpMock: HttpTestingController;

  const setupWithId = (id: string | null) => {
    router = { navigate: vi.fn() };
    TestBed.configureTestingModule({
      imports: [ClientFormComponent, NoopAnimationsModule],
      providers: [
        TranslationService,
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => id } } } },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
  };

  afterEach(() => httpMock.verify());

  it('create mode: no preload, save POSTs and navigates', () => {
    setupWithId(null);
    const fixture = TestBed.createComponent(ClientFormComponent);
    fixture.detectChanges();
    fixture.componentInstance.form.name = 'Acme';
    fixture.componentInstance.save();
    httpMock.expectOne(r => r.url.endsWith('/api/clients')).flush({
      id: '1', name: 'Acme', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/account-planning']);
  });

  it('edit mode: preloads by id, save PUTs and navigates', () => {
    setupWithId('c1');
    const fixture = TestBed.createComponent(ClientFormComponent);
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.endsWith('/api/clients/c1')).flush({
      id: 'c1', name: 'Acme', industry: 'Tech', country: 'CO',
      createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
    });
    expect(fixture.componentInstance.form.name).toBe('Acme');
    fixture.componentInstance.save();
    httpMock.expectOne(r => r.url.endsWith('/api/clients/c1')).flush({
      id: 'c1', name: 'Acme', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/account-planning']);
  });

  it('cancel navigates back', () => {
    setupWithId(null);
    const fixture = TestBed.createComponent(ClientFormComponent);
    fixture.detectChanges();
    fixture.componentInstance.cancel();
    expect(router.navigate).toHaveBeenCalledWith(['/account-planning']);
  });
});
