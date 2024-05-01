import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEditorReportsForecastLaborComponent } from './site-editor-reports-forecast-labor.component';

describe('SiteEditorReportsForecastLaborComponent', () => {
  let component: SiteEditorReportsForecastLaborComponent;
  let fixture: ComponentFixture<SiteEditorReportsForecastLaborComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEditorReportsForecastLaborComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEditorReportsForecastLaborComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
