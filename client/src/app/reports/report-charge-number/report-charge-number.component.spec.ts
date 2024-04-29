import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportChargeNumberComponent } from './report-charge-number.component';

describe('ReportChargeNumberComponent', () => {
  let component: ReportChargeNumberComponent;
  let fixture: ComponentFixture<ReportChargeNumberComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReportChargeNumberComponent]
    });
    fixture = TestBed.createComponent(ReportChargeNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
