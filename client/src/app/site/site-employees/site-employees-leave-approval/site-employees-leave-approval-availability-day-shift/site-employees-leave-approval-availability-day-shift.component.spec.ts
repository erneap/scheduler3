import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeesLeaveApprovalAvailabilityDayShiftComponent } from './site-employees-leave-approval-availability-day-shift.component';

describe('SiteEmployeesLeaveApprovalAvailabilityDayShiftComponent', () => {
  let component: SiteEmployeesLeaveApprovalAvailabilityDayShiftComponent;
  let fixture: ComponentFixture<SiteEmployeesLeaveApprovalAvailabilityDayShiftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeesLeaveApprovalAvailabilityDayShiftComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeesLeaveApprovalAvailabilityDayShiftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
