import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportCertOfServiceComponent } from './report-cert-of-service.component';

describe('ReportCertOfServiceComponent', () => {
  let component: ReportCertOfServiceComponent;
  let fixture: ComponentFixture<ReportCertOfServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportCertOfServiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportCertOfServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
