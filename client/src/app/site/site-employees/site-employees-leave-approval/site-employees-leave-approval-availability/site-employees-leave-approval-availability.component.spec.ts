import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeesLeaveApprovalAvailabilityComponent } from './site-employees-leave-approval-availability.component';

describe('SiteEmployeesLeaveApprovalAvailabilityComponent', () => {
  let component: SiteEmployeesLeaveApprovalAvailabilityComponent;
  let fixture: ComponentFixture<SiteEmployeesLeaveApprovalAvailabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeesLeaveApprovalAvailabilityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeesLeaveApprovalAvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
