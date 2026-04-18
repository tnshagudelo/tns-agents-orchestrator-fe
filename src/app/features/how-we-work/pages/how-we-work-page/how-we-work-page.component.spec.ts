import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HowWeWorkPageComponent } from './how-we-work-page.component';

describe('HowWeWorkPageComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HowWeWorkPageComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(HowWeWorkPageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('has 6 inception steps', () => {
    const fixture = TestBed.createComponent(HowWeWorkPageComponent);
    expect(fixture.componentInstance.inceptionSteps).toHaveLength(6);
  });

  it('has 7 inception outputs', () => {
    const fixture = TestBed.createComponent(HowWeWorkPageComponent);
    expect(fixture.componentInstance.inceptionOutputs).toHaveLength(7);
  });

  it('has 4 phases', () => {
    const fixture = TestBed.createComponent(HowWeWorkPageComponent);
    expect(fixture.componentInstance.phases).toHaveLength(4);
  });

  it('has 6 ceremonies', () => {
    const fixture = TestBed.createComponent(HowWeWorkPageComponent);
    expect(fixture.componentInstance.ceremonies).toHaveLength(6);
  });

  it('has 5 quality items', () => {
    const fixture = TestBed.createComponent(HowWeWorkPageComponent);
    expect(fixture.componentInstance.qualityItems).toHaveLength(5);
  });

  it('has 4 success stats', () => {
    const fixture = TestBed.createComponent(HowWeWorkPageComponent);
    expect(fixture.componentInstance.successStats).toHaveLength(4);
  });

  it('has 6 differentiators', () => {
    const fixture = TestBed.createComponent(HowWeWorkPageComponent);
    expect(fixture.componentInstance.differentiators).toHaveLength(6);
  });

  it('inception steps include AI-flagged steps', () => {
    const fixture = TestBed.createComponent(HowWeWorkPageComponent);
    const aiSteps = fixture.componentInstance.inceptionSteps.filter(s => s.ai);
    expect(aiSteps.length).toBeGreaterThan(0);
  });
});
