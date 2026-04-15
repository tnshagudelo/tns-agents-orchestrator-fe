import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from './header.component';
import { AuthService } from '../../core/auth/auth.service';
import { TranslationService } from '../../core/i18n/translation.service';
import { NotificationService } from '../../core/services/notification.service';

describe('HeaderComponent', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HeaderComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { currentUser: () => null, logout: vi.fn() } },
        NotificationService,
        TranslationService,
      ],
    });
  });

  it('creates with default lang options', async () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.langOptions).toHaveLength(2);
  });

  it('setLanguage delegates to TranslationService', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    const i18n = TestBed.inject(TranslationService);
    const spy = vi.spyOn(i18n, 'setLanguage');
    fixture.componentInstance.setLanguage('en');
    expect(spy).toHaveBeenCalledWith('en');
  });

  it('roleLabel translates known roles and falls back for others', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    expect(fixture.componentInstance.roleLabel('builder')).toBe('Constructor');
    expect(fixture.componentInstance.roleLabel('reviewer')).toBe('Revisor');
    expect(fixture.componentInstance.roleLabel('approver')).toBe('Aprobador/a');
    expect(fixture.componentInstance.roleLabel('admin')).toBe('admin');
  });

  it('emits toggleSidebar event when triggered', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    const handler = vi.fn();
    fixture.componentInstance.toggleSidebar.subscribe(handler);
    fixture.componentInstance.toggleSidebar.emit();
    expect(handler).toHaveBeenCalled();
  });
});
