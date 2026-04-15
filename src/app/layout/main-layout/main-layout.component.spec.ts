import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MainLayoutComponent } from './main-layout.component';
import { AuthService } from '../../core/auth/auth.service';
import { TranslationService } from '../../core/i18n/translation.service';
import { NotificationService } from '../../core/services/notification.service';

describe('MainLayoutComponent', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [MainLayoutComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { currentUser: () => null } },
        NotificationService,
        TranslationService,
      ],
    });
  });

  it('toggleSidebar flips sidebarCollapsed state', () => {
    const fixture = TestBed.createComponent(MainLayoutComponent);
    expect(fixture.componentInstance.sidebarCollapsed()).toBe(false);
    fixture.componentInstance.toggleSidebar();
    expect(fixture.componentInstance.sidebarCollapsed()).toBe(true);
    fixture.componentInstance.toggleSidebar();
    expect(fixture.componentInstance.sidebarCollapsed()).toBe(false);
  });
});
