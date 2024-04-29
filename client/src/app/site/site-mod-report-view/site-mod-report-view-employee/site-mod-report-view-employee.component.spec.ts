import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteModReportViewEmployeeComponent } from './site-mod-report-view-employee.component';

describe('SiteModReportViewEmployeeComponent', () => {
  let component: SiteModReportViewEmployeeComponent;
  let fixture: ComponentFixture<SiteModReportViewEmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteModReportViewEmployeeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteModReportViewEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
