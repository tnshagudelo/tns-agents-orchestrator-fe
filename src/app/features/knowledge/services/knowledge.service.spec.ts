import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { KnowledgeService } from './knowledge.service';
import { environment } from '../../../../environments/environment';

describe('KnowledgeService', () => {
  let svc: KnowledgeService;
  let httpMock: HttpTestingController;
  const url = (p: string) => `${environment.apiUrl}${p}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KnowledgeService, provideHttpClient(), provideHttpClientTesting()],
    });
    svc = TestBed.inject(KnowledgeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('ingestFiles posts FormData to /api/knowledge/ingest', async () => {
    const file = new File(['a'], 'a.txt', { type: 'text/plain' });
    const p = firstValueFrom(svc.ingestFiles([file], 'docs'));
    const req = httpMock.expectOne(url('/api/knowledge/ingest'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeInstanceOf(FormData);
    req.flush({ success: true, data: { total: 1 } });
    await p;
  });

  it('ingestFiles default category is "general"', async () => {
    const file = new File(['a'], 'a.txt');
    const p = firstValueFrom(svc.ingestFiles([file]));
    const req = httpMock.expectOne(url('/api/knowledge/ingest'));
    req.flush({ success: true, data: {} });
    await p;
  });

  it('getStatus hits /status and returns wrapped data', async () => {
    const p = firstValueFrom(svc.getStatus());
    httpMock.expectOne(url('/api/knowledge/status')).flush({
      success: true,
      data: { exists: true, vectorCount: 10 },
    });
    const res = await p;
    expect(res.success).toBe(true);
  });

  it('loadStatus sets collectionStatus and exposes computed helpers', () => {
    svc.loadStatus();
    expect(svc.isLoadingStatus()).toBe(true);
    httpMock.expectOne(url('/api/knowledge/status')).flush({
      success: true,
      data: { exists: true, vectorCount: 42 },
    });
    expect(svc.collectionStatus()?.vectorCount).toBe(42);
    expect(svc.vectorCount()).toBe(42);
    expect(svc.collectionExists()).toBe(true);
    expect(svc.isLoadingStatus()).toBe(false);
  });

  it('vectorCount defaults to 0 when no status', () => {
    expect(svc.vectorCount()).toBe(0);
    expect(svc.collectionExists()).toBe(false);
  });

  it('loadStatus ignores errors', () => {
    svc.loadStatus();
    httpMock.expectOne(url('/api/knowledge/status')).error(new ProgressEvent('err'));
    expect(svc.collectionStatus()).toBeNull();
  });

  it('search updates results and toggles isSearching', async () => {
    const p = firstValueFrom(svc.search('hi'));
    expect(svc.isSearching()).toBe(true);
    const req = httpMock.expectOne(r => r.url === url('/api/knowledge/search'));
    expect(req.request.params.get('q')).toBe('hi');
    expect(req.request.params.get('topK')).toBe('5');
    req.flush({ success: true, data: { items: [{ id: '1' }] } });
    await p;
    expect(svc.searchResults()).toHaveLength(1);
    expect(svc.isSearching()).toBe(false);
  });

  it('search does not set results on unsuccessful response', async () => {
    const p = firstValueFrom(svc.search('x'));
    httpMock.expectOne(r => r.url === url('/api/knowledge/search'))
      .flush({ success: false });
    await p;
    expect(svc.searchResults()).toEqual([]);
  });

  it('deleteCollection issues DELETE', async () => {
    const p = firstValueFrom(svc.deleteCollection());
    httpMock.expectOne(url('/api/knowledge/collection')).flush({ success: true });
    await p;
  });
});
