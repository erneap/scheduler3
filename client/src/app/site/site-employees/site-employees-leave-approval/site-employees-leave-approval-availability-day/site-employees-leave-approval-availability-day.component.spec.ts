import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeesLeaveApprovalAvailabilityDayComponent } from './site-employees-leave-approval-availability-day.component';

describe('SiteEmployeesLeaveApprovalAvailabilityDayComponent', () => {
  let component: SiteEmployeesLeaveApprovalAvailabilityDayComponent;
  let fixture: ComponentFixture<SiteEmployeesLeaveApprovalAvailabilityDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeesLeaveApprovalAvailabilityDayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeesLeaveApprovalAvailabilityDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
