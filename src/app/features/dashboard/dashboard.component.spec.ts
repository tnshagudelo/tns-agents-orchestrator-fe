import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DashboardComponent, NoopAnimationsModule],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('calls all three data loaders on init', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.endsWith('/agents')).flush({ items: [], total: 0 });
    httpMock.expectOne(r => r.url.endsWith('/pipelines')).flush({ items: [], total: 0 });
    httpMock.expectOne(r => r.url.endsWith('/logs')).flush({ items: [], total: 0 });
  });
});
