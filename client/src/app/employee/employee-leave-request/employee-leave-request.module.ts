import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeLeaveRequestComponent } from './employee-leave-request.component';
import { EmployeeLeaveRequestEditorComponent } from './employee-leave-request-editor/employee-leave-request-editor.component';
import { EmployeeLeaveRequestEditorCalendarComponent } from './employee-leave-request-editor/employee-leave-request-editor-calendar/employee-leave-request-editor-calendar.component';
import { EmployeeLeaveRequestEditorCalendarWeekComponent } from './employee-leave-request-editor/employee-leave-request-editor-calendar/employee-leave-request-editor-calendar-week/employee-leave-request-editor-calendar-week.component';
import { EmployeeLeaveRequestEditorCalendarDayComponent } from './employee-leave-request-editor/employee-leave-request-editor-calendar/employee-leave-request-editor-calendar-day/employee-leave-request-editor-calendar-day.component';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmployeeLeaveRequestEditorUnapproveComponent } from './employee-leave-request-editor/employee-leave-request-editor-unapprove/employee-leave-request-editor-unapprove.component';
import { EmployeeLeaveRequestEditorLegendComponent } from './employee-leave-request-editor/employee-leave-request-editor-legend/employee-leave-request-editor-legend.component';
import { EmployeeLeaveRequestEditorMidDenialComponent } from './employee-leave-request-editor/employee-leave-request-editor-mid-denial/employee-leave-request-editor-mid-denial.component';

@NgModule({
  declarations: [
    EmployeeLeaveRequestComponent,
    EmployeeLeaveRequestEditorComponent,
    EmployeeLeaveRequestEditorCalendarComponent,
    EmployeeLeaveRequestEditorCalendarWeekComponent,
    EmployeeLeaveRequestEditorCalendarDayComponent,
    EmployeeLeaveRequestEditorUnapproveComponent,
    EmployeeLeaveRequestEditorLegendComponent,
    EmployeeLeaveRequestEditorMidDenialComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    EmployeeLeaveRequestEditorComponent,
    EmployeeLeaveRequestComponent
  ]
})
export class EmployeeLeaveRequestModule { }
