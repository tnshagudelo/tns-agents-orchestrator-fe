import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HomeComponent } from './home.component';
import { TranslationService } from '../../core/i18n/translation.service';

describe('HomeComponent', () => {
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    localStorage.clear();
    router = { navigate: vi.fn() };
    TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: Router, useValue: router },
        TranslationService,
      ],
    });
  });

  it('renders with modules and steps metadata', async () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.modules.length).toBeGreaterThan(0);
    expect(fixture.componentInstance.methodSteps.length).toBeGreaterThan(0);
  });

  it('navigateTo delegates to Router', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.componentInstance.navigateTo('/account-planning');
    expect(router.navigate).toHaveBeenCalledWith(['/account-planning']);
  });
});
