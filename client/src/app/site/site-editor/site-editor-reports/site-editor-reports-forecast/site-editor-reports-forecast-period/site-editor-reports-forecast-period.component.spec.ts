import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEditorReportsForecastPeriodComponent } from './site-editor-reports-forecast-period.component';

describe('SiteEditorReportsForecastPeriodComponent', () => {
  let component: SiteEditorReportsForecastPeriodComponent;
  let fixture: ComponentFixture<SiteEditorReportsForecastPeriodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEditorReportsForecastPeriodComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEditorReportsForecastPeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
