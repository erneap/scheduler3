import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeeLeaveRequestAvailabilityPeriodComponent } from './site-employee-leave-request-availability-period.component';

describe('SiteEmployeeLeaveRequestAvailabilityPeriodComponent', () => {
  let component: SiteEmployeeLeaveRequestAvailabilityPeriodComponent;
  let fixture: ComponentFixture<SiteEmployeeLeaveRequestAvailabilityPeriodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeeLeaveRequestAvailabilityPeriodComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeeLeaveRequestAvailabilityPeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
