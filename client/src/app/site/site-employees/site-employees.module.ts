import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteEmployeesComponent } from './site-employees.component';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SiteEmployeesEditorComponent } from './site-employees-editor/site-employees-editor.component';
import { NewSiteEmployeesEditorComponent } from './new-site-employees-editor/new-site-employees-editor.component';
import { SiteEmployeesAssignmentComponent } from './site-employees-assignment/site-employees-assignment.component';
import { SiteEmployeesAssignmentScheduleComponent } from './site-employees-assignment/site-employees-assignment-schedule/site-employees-assignment-schedule.component';
import { SiteEmployeesAssignmentScheduleDayComponent } from './site-employees-assignment/site-employees-assignment-schedule-day/site-employees-assignment-schedule-day.component';
import { EmployeeModule } from 'src/app/employee/employee.module';
import { SiteEmployeesLeaveComponent } from './site-employees-leave/site-employees-leave.component';
import { SiteEmployeesLeaveBalanceComponent } from './site-employees-leave-balance/site-employees-leave-balance.component';
import { SiteEmployeesLeaveBalanceDialogComponent } from './site-employees-leave-balance/site-employees-leave-balance-dialog/site-employees-leave-balance-dialog.component';
import { SiteEmployeesLeaveBalanceYearComponent } from './site-employees-leave-balance/site-employees-leave-balance-year/site-employees-leave-balance-year.component';
import { SiteEmployeesCompanyInfoComponent } from './site-employees-company-info/site-employees-company-info.component';
import { SiteEmployeesVariationComponent } from './site-employees-variation/site-employees-variation.component';
import { SiteEmployeesLeaveRequestApproverComponent } from './site-employees-leave-request-approver/site-employees-leave-request-approver.component';
import { SiteEmployeesLeaveApprovalComponent } from './site-employees-leave-approval/site-employees-leave-approval.component';
import { SiteEmployeesLeaveApprovalAvailabilityComponent } from './site-employees-leave-approval/site-employees-leave-approval-availability/site-employees-leave-approval-availability.component';
import { SiteEmployeesLeaveApprovalAvailabilityDayComponent } from './site-employees-leave-approval/site-employees-leave-approval-availability-day/site-employees-leave-approval-availability-day.component';
import { SiteEmployeesLeaveApprovalAvailabilityDayShiftComponent } from './site-employees-leave-approval/site-employees-leave-approval-availability-day-shift/site-employees-leave-approval-availability-day-shift.component';
import { EmployeeLeaveRequestModule } from 'src/app/employee/employee-leave-request/employee-leave-request.module';
import { SiteEmployeesLeaveChartComponent } from './site-employees-leave/site-employees-leave-chart/site-employees-leave-chart.component';
import { SiteEmployeesLeaveChartRowComponent } from './site-employees-leave/site-employees-leave-chart/site-employees-leave-chart-row/site-employees-leave-chart-row.component';
import { SiteEmployeesVariationCalendarComponent } from './site-employees-variation/site-employees-variation-calendar/site-employees-variation-calendar.component';
import { SiteEmployeesVariationCalendarDayComponent } from './site-employees-variation/site-employees-variation-calendar/site-employees-variation-calendar-day/site-employees-variation-calendar-day.component';


@NgModule({
  declarations: [
    SiteEmployeesComponent,
    SiteEmployeesEditorComponent,
    NewSiteEmployeesEditorComponent,
    SiteEmployeesAssignmentComponent,
    SiteEmployeesAssignmentScheduleComponent,
    SiteEmployeesAssignmentScheduleDayComponent,
    SiteEmployeesLeaveComponent,
    SiteEmployeesLeaveBalanceComponent,
    SiteEmployeesLeaveBalanceDialogComponent,
    SiteEmployeesLeaveBalanceYearComponent,
    SiteEmployeesCompanyInfoComponent,
    SiteEmployeesVariationComponent,
    SiteEmployeesLeaveRequestApproverComponent,
    SiteEmployeesLeaveApprovalComponent,
    SiteEmployeesLeaveApprovalAvailabilityComponent,
    SiteEmployeesLeaveApprovalAvailabilityDayComponent,
    SiteEmployeesLeaveApprovalAvailabilityDayShiftComponent,
    SiteEmployeesLeaveChartComponent,
    SiteEmployeesLeaveChartRowComponent,
    SiteEmployeesVariationCalendarComponent,
    SiteEmployeesVariationCalendarDayComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    EmployeeModule,
    EmployeeLeaveRequestModule
  ],
  exports: [
    SiteEmployeesLeaveApprovalComponent,
    NewSiteEmployeesEditorComponent,
    SiteEmployeesEditorComponent,
    SiteEmployeesComponent
  ]
})
export class SiteEmployeesModule { }
