import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { ClientService } from './client.service';
import { environment } from '../../../../environments/environment';

const rawClient = {
  id: 'c1',
  name: 'Acme',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-02-01T00:00:00Z',
};

describe('ClientService', () => {
  let svc: ClientService;
  let httpMock: HttpTestingController;
  const url = (p: string) => `${environment.apiUrl}${p}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClientService, provideHttpClient(), provideHttpClientTesting()],
    });
    svc = TestBed.inject(ClientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loadAll normalizes dates and sets state', async () => {
    const p = firstValueFrom(svc.loadAll());
    expect(svc.isLoading()).toBe(true);
    httpMock.expectOne(url('/api/clients')).flush([rawClient]);
    const list = await p;
    expect(list[0].createdAt).toBeInstanceOf(Date);
    expect(svc.clients()).toHaveLength(1);
    expect(svc.isLoading()).toBe(false);
  });

  it('loadAll tolerates null payload', async () => {
    const p = firstValueFrom(svc.loadAll());
    httpMock.expectOne(url('/api/clients')).flush(null);
    expect(await p).toEqual([]);
  });

  it('getById normalizes dates', async () => {
    const p = firstValueFrom(svc.getById('c1'));
    httpMock.expectOne(url('/api/clients/c1')).flush(rawClient);
    const c = await p;
    expect(c.updatedAt).toBeInstanceOf(Date);
  });

  it('create prepends to list', async () => {
    const p = firstValueFrom(svc.create({ name: 'New' } as never));
    httpMock.expectOne(url('/api/clients')).flush({ ...rawClient, id: 'new' });
    await p;
    expect(svc.clients()[0].id).toBe('new');
  });

  it('update replaces existing entry', async () => {
    (svc as unknown as { _clients: { set: (v: unknown) => void } })._clients =
      (svc as unknown as { _clients: { set: (v: unknown) => void } })._clients;
    // prime cache via create
    const prime = firstValueFrom(svc.create({ name: 'A' } as never));
    httpMock.expectOne(url('/api/clients')).flush(rawClient);
    await prime;

    const p = firstValueFrom(svc.update('c1', { name: 'B' } as never));
    httpMock.expectOne(url('/api/clients/c1')).flush({ ...rawClient, name: 'B' });
    await p;
    expect(svc.clients()[0].name).toBe('B');
  });

  it('remove filters entry out of list', async () => {
    const prime = firstValueFrom(svc.create({ name: 'A' } as never));
    httpMock.expectOne(url('/api/clients')).flush(rawClient);
    await prime;

    const p = firstValueFrom(svc.remove('c1'));
    httpMock.expectOne(url('/api/clients/c1')).flush(null);
    await p;
    expect(svc.clients()).toHaveLength(0);
  });
});
