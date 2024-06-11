import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeLeaveRequestEditorCalendarWeekComponent } from './employee-leave-request-editor-calendar-week.component';

describe('EmployeeLeaveRequestEditorCalendarWeekComponent', () => {
  let component: EmployeeLeaveRequestEditorCalendarWeekComponent;
  let fixture: ComponentFixture<EmployeeLeaveRequestEditorCalendarWeekComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeLeaveRequestEditorCalendarWeekComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeLeaveRequestEditorCalendarWeekComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
