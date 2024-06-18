import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteModReportViewChartComponent } from './site-mod-report-view-chart.component';

describe('SiteModReportViewChartComponent', () => {
  let component: SiteModReportViewChartComponent;
  let fixture: ComponentFixture<SiteModReportViewChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SiteModReportViewChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteModReportViewChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
