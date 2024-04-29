import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteForecastReportLaborCodesComponent } from './site-forecast-report-labor-codes.component';

describe('SiteForecastReportLaborCodesComponent', () => {
  let component: SiteForecastReportLaborCodesComponent;
  let fixture: ComponentFixture<SiteForecastReportLaborCodesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteForecastReportLaborCodesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteForecastReportLaborCodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
