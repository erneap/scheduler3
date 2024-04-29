import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeeLeaveRequestAvailabilityDayComponent } from './site-employee-leave-request-availability-day.component';

describe('SiteEmployeeLeaveRequestAvailabilityDayComponent', () => {
  let component: SiteEmployeeLeaveRequestAvailabilityDayComponent;
  let fixture: ComponentFixture<SiteEmployeeLeaveRequestAvailabilityDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeeLeaveRequestAvailabilityDayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeeLeaveRequestAvailabilityDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
