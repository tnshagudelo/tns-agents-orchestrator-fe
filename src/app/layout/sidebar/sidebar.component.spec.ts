import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('creates with default collapsed=false', async () => {
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.collapsed()).toBe(false);
    expect(fixture.componentInstance.navItems().length).toBeGreaterThan(0);
  });

  it('exposes collapsed=true when input set', async () => {
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.componentRef.setInput('collapsed', true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.collapsed()).toBe(true);
  });
});
