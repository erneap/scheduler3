import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeeLeaveRequestAvailabilityShiftComponent } from './site-employee-leave-request-availability-shift.component';

describe('SiteEmployeeLeaveRequestAvailabilityShiftComponent', () => {
  let component: SiteEmployeeLeaveRequestAvailabilityShiftComponent;
  let fixture: ComponentFixture<SiteEmployeeLeaveRequestAvailabilityShiftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeeLeaveRequestAvailabilityShiftComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeeLeaveRequestAvailabilityShiftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
