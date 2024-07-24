import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeLeaveRequestEditorModtimeCalendarWeekDayComponent } from './employee-leave-request-editor-modtime-calendar-week-day.component';

describe('EmployeeLeaveRequestEditorModtimeCalendarWeekDayComponent', () => {
  let component: EmployeeLeaveRequestEditorModtimeCalendarWeekDayComponent;
  let fixture: ComponentFixture<EmployeeLeaveRequestEditorModtimeCalendarWeekDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeLeaveRequestEditorModtimeCalendarWeekDayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeLeaveRequestEditorModtimeCalendarWeekDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
