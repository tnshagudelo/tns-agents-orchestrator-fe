import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { OrchestrationService } from './orchestration.service';
import { environment } from '../../../../environments/environment';

const pipe = (id: string) => ({ id, name: `p-${id}` });

describe('OrchestrationService', () => {
  let svc: OrchestrationService;
  let httpMock: HttpTestingController;
  const url = (p: string) => `${environment.apiUrl}${p}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrchestrationService, provideHttpClient(), provideHttpClientTesting()],
    });
    svc = TestBed.inject(OrchestrationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loadPipelines populates state', async () => {
    const p = firstValueFrom(svc.loadPipelines());
    expect(svc.isLoading()).toBe(true);
    httpMock.expectOne(r => r.url === url('/pipelines')).flush({ items: [pipe('1')], total: 1 });
    await p;
    expect(svc.pipelines()).toHaveLength(1);
    expect(svc.isLoading()).toBe(false);
  });

  it('loadPipeline selects it', async () => {
    const p = firstValueFrom(svc.loadPipeline('1'));
    httpMock.expectOne(url('/pipelines/1')).flush(pipe('1'));
    await p;
    expect(svc.selectedPipeline()?.id).toBe('1');
  });

  it('createPipeline appends', async () => {
    const p = firstValueFrom(svc.createPipeline({ name: 'x' }));
    httpMock.expectOne(url('/pipelines')).flush(pipe('new'));
    await p;
    expect(svc.pipelines().some(x => x.id === 'new')).toBe(true);
  });

  it('savePipeline updates list and selection', async () => {
    const prime = firstValueFrom(svc.createPipeline({ name: 'a' }));
    httpMock.expectOne(url('/pipelines')).flush(pipe('1'));
    await prime;
    const p = firstValueFrom(svc.savePipeline(pipe('1') as never));
    httpMock.expectOne(url('/pipelines/1')).flush({ ...pipe('1'), name: 'renamed' });
    await p;
    expect(svc.pipelines()[0].name).toBe('renamed');
    expect(svc.selectedPipeline()?.name).toBe('renamed');
  });

  it('deletePipeline removes', async () => {
    const prime = firstValueFrom(svc.createPipeline({ name: 'a' }));
    httpMock.expectOne(url('/pipelines')).flush(pipe('1'));
    await prime;
    const p = firstValueFrom(svc.deletePipeline('1'));
    httpMock.expectOne(url('/pipelines/1')).flush(null);
    await p;
    expect(svc.pipelines()).toHaveLength(0);
  });

  it('runPipeline adds a run to activeRuns', async () => {
    const p = firstValueFrom(svc.runPipeline('1'));
    httpMock.expectOne(url('/pipelines/1/run')).flush({ id: 'run-1' });
    await p;
    expect(svc.activeRuns()).toHaveLength(1);
  });

  it('selectPipeline sets or clears selection', () => {
    svc.selectPipeline(pipe('9') as never);
    expect(svc.selectedPipeline()?.id).toBe('9');
    svc.selectPipeline(null);
    expect(svc.selectedPipeline()).toBeNull();
  });
});
