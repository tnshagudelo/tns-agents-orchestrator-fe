import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { OrchestrationBoardComponent } from './orchestration-board.component';

describe('OrchestrationBoardComponent', () => {
  let router: { navigate: ReturnType<typeof vi.fn> };
  let httpMock: HttpTestingController;

  beforeEach(() => {
    router = { navigate: vi.fn() };
    TestBed.configureTestingModule({
      imports: [OrchestrationBoardComponent, NoopAnimationsModule],
      providers: [
        { provide: Router, useValue: router },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads pipelines on init', () => {
    const fixture = TestBed.createComponent(OrchestrationBoardComponent);
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.endsWith('/pipelines')).flush({ items: [], total: 0 });
  });

  it('createPipeline/viewPipeline navigate', () => {
    const fixture = TestBed.createComponent(OrchestrationBoardComponent);
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.endsWith('/pipelines')).flush({ items: [], total: 0 });
    fixture.componentInstance.createPipeline();
    expect(router.navigate).toHaveBeenCalledWith(['/orchestration/create']);
    fixture.componentInstance.viewPipeline({ id: '1' } as never);
    expect(router.navigate).toHaveBeenCalledWith(['/orchestration', '1']);
  });

  it('runPipeline/deletePipeline call service', () => {
    const fixture = TestBed.createComponent(OrchestrationBoardComponent);
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.endsWith('/pipelines')).flush({ items: [], total: 0 });
    fixture.componentInstance.runPipeline('1');
    httpMock.expectOne(r => r.url.endsWith('/pipelines/1/run')).flush({ id: 'r' });
    fixture.componentInstance.deletePipeline('1');
    httpMock.expectOne(r => r.url.endsWith('/pipelines/1')).flush(null);
  });
});
