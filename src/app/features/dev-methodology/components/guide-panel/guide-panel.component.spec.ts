import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { GuidePanelComponent } from './guide-panel.component';
import { FrameworkStateService } from '../../services/framework-state.service';
import { ClipboardService } from '../../services/clipboard.service';
import { provideHttpClient } from '@angular/common/http';
import { provideMarkdown } from 'ngx-markdown';

describe('GuidePanelComponent', () => {
  let state: FrameworkStateService;
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    router = { navigate: vi.fn() };
    TestBed.configureTestingModule({
      imports: [GuidePanelComponent, NoopAnimationsModule],
      providers: [
        FrameworkStateService,
        ClipboardService,
        provideRouter([]),
        provideHttpClient(),
        provideMarkdown(),
        { provide: Router, useValue: router },
      ],
    });
    state = TestBed.inject(FrameworkStateService);
    state.selectMode('new');
    state.selectTech('angular');
  });

  it('exposes tech and modeLabel from state', () => {
    const fixture = TestBed.createComponent(GuidePanelComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.modeLabel()).toBe('Proyecto Nuevo');
    expect(fixture.componentInstance.tech()).toBeTruthy();
    expect(fixture.componentInstance.tabIndex()).toBe(0);
  });

  it('onTabChange updates activeTab', () => {
    const fixture = TestBed.createComponent(GuidePanelComponent);
    fixture.componentInstance.onTabChange(2);
    expect(state.activeTab()).toBe('specs');
  });

  it('goToModes resets state and navigates', () => {
    const fixture = TestBed.createComponent(GuidePanelComponent);
    fixture.componentInstance.goToModes();
    expect(state.mode()).toBeNull();
    expect(state.techId()).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/dev-methodology']);
  });

  it('goToTech clears techId and navigates', () => {
    const fixture = TestBed.createComponent(GuidePanelComponent);
    fixture.componentInstance.goToTech();
    expect(state.techId()).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/dev-methodology/tech']);
  });

  it('modeLabel is empty when mode is null', () => {
    state.mode.set(null);
    const fixture = TestBed.createComponent(GuidePanelComponent);
    expect(fixture.componentInstance.modeLabel()).toBe('');
  });
});
