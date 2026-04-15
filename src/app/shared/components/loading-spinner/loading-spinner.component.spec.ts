import { TestBed } from '@angular/core/testing';
import { LoadingSpinnerComponent } from './loading-spinner.component';
import { LoadingService } from '../../../core/interceptors/loading.interceptor';

describe('LoadingSpinnerComponent', () => {
  let loading: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoadingSpinnerComponent],
      providers: [LoadingService],
    });
    loading = TestBed.inject(LoadingService);
  });

  it('renders overlay when LoadingService.isLoading is true', async () => {
    loading.increment();
    const fixture = TestBed.createComponent(LoadingSpinnerComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('.loading-overlay')).toBeTruthy();
  });

  it('renders nothing when not loading', async () => {
    const fixture = TestBed.createComponent(LoadingSpinnerComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('.loading-overlay')).toBeNull();
  });
});
