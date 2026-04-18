import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { AllowedDomainService, AllowedDomain } from './allowed-domain.service';
import { environment } from '../../../../environments/environment';

const url = (p: string) => `${environment.apiUrl}${p}`;

const makeDomain = (overrides: Partial<AllowedDomain> = {}): AllowedDomain => ({
  id: 'd1',
  domain: 'techandsolve.com',
  description: 'T&S',
  isActive: true,
  createdAt: '2026-01-01T00:00:00Z',
  createdByUserId: 'u1',
  ...overrides,
});

describe('AllowedDomainService', () => {
  let svc: AllowedDomainService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AllowedDomainService, provideHttpClient(), provideHttpClientTesting()],
    });
    svc = TestBed.inject(AllowedDomainService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loadDomains sets domains signal', async () => {
    const p = firstValueFrom(svc.loadDomains());
    httpMock.expectOne(url('/api/config/allowed-domains')).flush([makeDomain()]);
    await p;
    expect(svc.domains()).toHaveLength(1);
    expect(svc.domains()[0].domain).toBe('techandsolve.com');
  });

  it('createDomain appends to list', async () => {
    // Seed
    const seed = firstValueFrom(svc.loadDomains());
    httpMock.expectOne(url('/api/config/allowed-domains')).flush([makeDomain()]);
    await seed;

    const newDomain = makeDomain({ id: 'd2', domain: 'example.com' });
    const p = firstValueFrom(svc.createDomain({ domain: 'example.com' }));
    httpMock.expectOne(url('/api/config/allowed-domains')).flush(newDomain);
    await p;

    expect(svc.domains()).toHaveLength(2);
    expect(svc.domains()[1].domain).toBe('example.com');
  });

  it('updateDomain replaces in list', async () => {
    const seed = firstValueFrom(svc.loadDomains());
    httpMock.expectOne(url('/api/config/allowed-domains')).flush([makeDomain()]);
    await seed;

    const updated = makeDomain({ description: 'Updated' });
    const p = firstValueFrom(svc.updateDomain('d1', { domain: 'techandsolve.com', isActive: true }));
    httpMock.expectOne(url('/api/config/allowed-domains/d1')).flush(updated);
    await p;

    expect(svc.domains()[0].description).toBe('Updated');
  });

  it('deleteDomain removes from list', async () => {
    const seed = firstValueFrom(svc.loadDomains());
    httpMock.expectOne(url('/api/config/allowed-domains')).flush([makeDomain()]);
    await seed;

    const p = firstValueFrom(svc.deleteDomain('d1'));
    httpMock.expectOne(url('/api/config/allowed-domains/d1')).flush(null);
    await p;

    expect(svc.domains()).toHaveLength(0);
  });
});
