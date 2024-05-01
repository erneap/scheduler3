import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEditorReportsForecastComponent } from './site-editor-reports-forecast.component';

describe('SiteEditorReportsForecastComponent', () => {
  let component: SiteEditorReportsForecastComponent;
  let fixture: ComponentFixture<SiteEditorReportsForecastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEditorReportsForecastComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEditorReportsForecastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
