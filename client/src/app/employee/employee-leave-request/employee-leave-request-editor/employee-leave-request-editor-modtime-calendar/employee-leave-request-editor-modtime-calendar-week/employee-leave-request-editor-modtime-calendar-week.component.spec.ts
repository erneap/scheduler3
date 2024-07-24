import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeLeaveRequestEditorModtimeCalendarWeekComponent } from './employee-leave-request-editor-modtime-calendar-week.component';

describe('EmployeeLeaveRequestEditorModtimeCalendarWeekComponent', () => {
  let component: EmployeeLeaveRequestEditorModtimeCalendarWeekComponent;
  let fixture: ComponentFixture<EmployeeLeaveRequestEditorModtimeCalendarWeekComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeLeaveRequestEditorModtimeCalendarWeekComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeLeaveRequestEditorModtimeCalendarWeekComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
