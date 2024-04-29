import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteForecastReportEditorComponent } from './site-forecast-report-editor.component';

describe('SiteForecastReportEditorComponent', () => {
  let component: SiteForecastReportEditorComponent;
  let fixture: ComponentFixture<SiteForecastReportEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteForecastReportEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteForecastReportEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
