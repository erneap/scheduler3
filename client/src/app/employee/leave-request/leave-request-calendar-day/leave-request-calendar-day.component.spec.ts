import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveRequestCalendarDayComponent } from './leave-request-calendar-day.component';

describe('LeaveRequestCalendarDayComponent', () => {
  let component: LeaveRequestCalendarDayComponent;
  let fixture: ComponentFixture<LeaveRequestCalendarDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaveRequestCalendarDayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveRequestCalendarDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
