import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TechSelectorComponent } from './tech-selector.component';
import { FrameworkStateService } from '../../services/framework-state.service';

describe('TechSelectorComponent', () => {
  let router: { navigate: ReturnType<typeof vi.fn> };
  let state: FrameworkStateService;

  beforeEach(() => {
    router = { navigate: vi.fn() };
    TestBed.configureTestingModule({
      imports: [TechSelectorComponent, NoopAnimationsModule],
      providers: [
        FrameworkStateService,
        provideRouter([]),
        { provide: Router, useValue: router },
      ],
    });
    state = TestBed.inject(FrameworkStateService);
    state.selectMode('new');
  });

  it('renders technologies and modeLabel', () => {
    const fixture = TestBed.createComponent(TechSelectorComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.technologies.length).toBeGreaterThan(0);
    expect(fixture.componentInstance.modeLabel()).toBe('Proyecto Nuevo');
  });

  it('select navigates to guide', () => {
    const fixture = TestBed.createComponent(TechSelectorComponent);
    fixture.componentInstance.select('angular');
    expect(state.techId()).toBe('angular');
    expect(router.navigate).toHaveBeenCalledWith(['/dev-methodology/guide']);
  });

  it('goBack clears tech and navigates to modes', () => {
    state.selectTech('angular');
    const fixture = TestBed.createComponent(TechSelectorComponent);
    fixture.componentInstance.goBack();
    expect(state.techId()).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/dev-methodology']);
  });
});
