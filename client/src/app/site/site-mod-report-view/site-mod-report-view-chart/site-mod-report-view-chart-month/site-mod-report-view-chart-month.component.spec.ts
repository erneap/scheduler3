import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteModReportViewChartMonthComponent } from './site-mod-report-view-chart-month.component';

describe('SiteModReportViewChartMonthComponent', () => {
  let component: SiteModReportViewChartMonthComponent;
  let fixture: ComponentFixture<SiteModReportViewChartMonthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SiteModReportViewChartMonthComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteModReportViewChartMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
