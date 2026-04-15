import { TestBed } from '@angular/core/testing';
import { Injectable } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
class TestApi extends BaseApiService {
  getT<T>(path: string, params?: Record<string, string | number>) {
    return this.get<T>(path, params);
  }
  postT<T>(path: string, body: unknown) {
    return this.post<T>(path, body);
  }
  putT<T>(path: string, body: unknown) {
    return this.put<T>(path, body);
  }
  patchT<T>(path: string, body: unknown) {
    return this.patch<T>(path, body);
  }
  deleteT<T>(path: string) {
    return this.delete<T>(path);
  }
  listT<T>(path: string, page?: number, size?: number) {
    return this.getList<T>(path, page, size);
  }
  oneT<T>(path: string) {
    return this.getOne<T>(path);
  }
}

describe('BaseApiService', () => {
  let api: TestApi;
  let httpMock: HttpTestingController;
  const url = (p: string) => `${environment.apiUrl}${p}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TestApi, provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(TestApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('get builds query params and resolves response', async () => {
    const p = firstValueFrom(api.getT<{ ok: boolean }>('/x', { a: 'b', n: 2 }));
    const req = httpMock.expectOne(r => r.url === url('/x'));
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('a')).toBe('b');
    expect(req.request.params.get('n')).toBe('2');
    req.flush({ ok: true });
    expect(await p).toEqual({ ok: true });
  });

  it('get works without params', async () => {
    const p = firstValueFrom(api.getT<number>('/y'));
    const req = httpMock.expectOne(url('/y'));
    req.flush(1);
    expect(await p).toBe(1);
  });

  it('post/put/patch send body and return response', async () => {
    for (const [method, call] of [
      ['POST', () => api.postT<{ id: number }>('/p', { v: 1 })],
      ['PUT', () => api.putT<{ id: number }>('/p', { v: 1 })],
      ['PATCH', () => api.patchT<{ id: number }>('/p', { v: 1 })],
    ] as const) {
      const p = firstValueFrom(call());
      const req = httpMock.expectOne(url('/p'));
      expect(req.request.method).toBe(method);
      expect(req.request.body).toEqual({ v: 1 });
      req.flush({ id: 1 });
      expect(await p).toEqual({ id: 1 });
    }
  });

  it('delete issues DELETE', async () => {
    const p = firstValueFrom(api.deleteT<void>('/d'));
    const req = httpMock.expectOne(url('/d'));
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    await p;
  });

  it('getList defaults to page=1 pageSize=20', async () => {
    const p = firstValueFrom(api.listT('/l'));
    const req = httpMock.expectOne(r => r.url === url('/l'));
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('pageSize')).toBe('20');
    req.flush({ items: [], total: 0 });
    await p;
  });

  it('getList respects custom page/pageSize', async () => {
    const p = firstValueFrom(api.listT('/l', 3, 50));
    const req = httpMock.expectOne(r => r.url === url('/l'));
    expect(req.request.params.get('page')).toBe('3');
    expect(req.request.params.get('pageSize')).toBe('50');
    req.flush({ items: [], total: 0 });
    await p;
  });

  it('getOne issues GET with no params', async () => {
    const p = firstValueFrom(api.oneT('/one'));
    const req = httpMock.expectOne(url('/one'));
    expect(req.request.method).toBe('GET');
    req.flush({ data: { x: 1 } });
    await p;
  });
});
