import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveRequestCalendarComponent } from './leave-request-calendar.component';

describe('LeaveRequestCalendarComponent', () => {
  let component: LeaveRequestCalendarComponent;
  let fixture: ComponentFixture<LeaveRequestCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaveRequestCalendarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveRequestCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
