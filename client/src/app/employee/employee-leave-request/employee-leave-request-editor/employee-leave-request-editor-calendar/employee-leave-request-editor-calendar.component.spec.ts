import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeLeaveRequestEditorCalendarComponent } from './employee-leave-request-editor-calendar.component';

describe('EmployeeLeaveRequestEditorCalendarComponent', () => {
  let component: EmployeeLeaveRequestEditorCalendarComponent;
  let fixture: ComponentFixture<EmployeeLeaveRequestEditorCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeLeaveRequestEditorCalendarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeLeaveRequestEditorCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
