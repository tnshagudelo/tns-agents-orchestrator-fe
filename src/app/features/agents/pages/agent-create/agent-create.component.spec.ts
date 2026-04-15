import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AgentCreateComponent } from './agent-create.component';

describe('AgentCreateComponent', () => {
  let router: { navigate: ReturnType<typeof vi.fn> };
  let httpMock: HttpTestingController;

  beforeEach(() => {
    router = { navigate: vi.fn() };
    TestBed.configureTestingModule({
      imports: [AgentCreateComponent, NoopAnimationsModule],
      providers: [
        { provide: Router, useValue: router },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('form starts with defaults', () => {
    const fixture = TestBed.createComponent(AgentCreateComponent);
    expect(fixture.componentInstance.form.get('type')?.value).toBe('llm');
    expect(fixture.componentInstance.form.invalid).toBe(true);
  });

  it('submit does nothing when form invalid', () => {
    const fixture = TestBed.createComponent(AgentCreateComponent);
    fixture.componentInstance.submit();
    httpMock.verify();
  });

  it('submit creates agent and navigates on success', () => {
    const fixture = TestBed.createComponent(AgentCreateComponent);
    fixture.componentInstance.form.patchValue({ name: 'Ag', description: 'd' });
    fixture.componentInstance.submit();
    httpMock.expectOne(r => r.url.endsWith('/agents')).flush({ id: 'new', name: 'Ag', status: 'stopped' });
    expect(router.navigate).toHaveBeenCalledWith(['/agents', 'new']);
  });

  it('back navigates to /agents', () => {
    const fixture = TestBed.createComponent(AgentCreateComponent);
    fixture.componentInstance.back();
    expect(router.navigate).toHaveBeenCalledWith(['/agents']);
  });
});
