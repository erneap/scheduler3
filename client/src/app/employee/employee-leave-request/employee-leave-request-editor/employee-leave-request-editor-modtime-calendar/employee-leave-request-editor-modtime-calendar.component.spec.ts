import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeLeaveRequestEditorModtimeCalendarComponent } from './employee-leave-request-editor-modtime-calendar.component';

describe('EmployeeLeaveRequestEditorModtimeCalendarComponent', () => {
  let component: EmployeeLeaveRequestEditorModtimeCalendarComponent;
  let fixture: ComponentFixture<EmployeeLeaveRequestEditorModtimeCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeLeaveRequestEditorModtimeCalendarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeLeaveRequestEditorModtimeCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
