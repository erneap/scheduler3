import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteForecastReportPeriodsComponent } from './site-forecast-report-periods.component';

describe('SiteForecastReportPeriodsComponent', () => {
  let component: SiteForecastReportPeriodsComponent;
  let fixture: ComponentFixture<SiteForecastReportPeriodsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteForecastReportPeriodsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteForecastReportPeriodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
