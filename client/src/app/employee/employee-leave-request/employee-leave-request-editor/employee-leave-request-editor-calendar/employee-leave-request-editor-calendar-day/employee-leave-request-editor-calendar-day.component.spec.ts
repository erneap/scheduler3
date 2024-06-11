import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeLeaveRequestEditorCalendarDayComponent } from './employee-leave-request-editor-calendar-day.component';

describe('EmployeeLeaveRequestEditorCalendarDayComponent', () => {
  let component: EmployeeLeaveRequestEditorCalendarDayComponent;
  let fixture: ComponentFixture<EmployeeLeaveRequestEditorCalendarDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeLeaveRequestEditorCalendarDayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeLeaveRequestEditorCalendarDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
