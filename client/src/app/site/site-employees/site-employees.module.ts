import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteEmployeesComponent } from './site-employees/site-employees.component';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SiteEmployeesEditorComponent } from './site-employees/site-employees-editor/site-employees-editor.component';
import { NewSiteEmployeesEditorComponent } from './site-employees/new-site-employees-editor/new-site-employees-editor.component';
import { SiteEmployeesAssignmentComponent } from './site-employees/site-employees-assignment/site-employees-assignment.component';
import { SiteEmployeesAssignmentScheduleComponent } from './site-employees/site-employees-assignment/site-employees-assignment-schedule/site-employees-assignment-schedule.component';
import { SiteEmployeesAssignmentScheduleDayComponent } from './site-employees/site-employees-assignment/site-employees-assignment-schedule-day/site-employees-assignment-schedule-day.component';
import { EmployeeModule } from 'src/app/employee/employee.module';
import { SiteEmployeesLeaveComponent } from './site-employees/site-employees-leave/site-employees-leave.component';
import { SiteEmployeesLeaveRowComponent } from './site-employees/site-employees-leave/site-employees-leave-row/site-employees-leave-row.component';
import { SiteEmployeesLeaveBalanceComponent } from './site-employees/site-employees-leave-balance/site-employees-leave-balance.component';
import { SiteEmployeesLeaveBalanceDialogComponent } from './site-employees/site-employees-leave-balance/site-employees-leave-balance-dialog/site-employees-leave-balance-dialog.component';
import { SiteEmployeesLeaveBalanceYearComponent } from './site-employees/site-employees-leave-balance/site-employees-leave-balance-year/site-employees-leave-balance-year.component';
import { SiteEmployeesCompanyInfoComponent } from './site-employees/site-employees-company-info/site-employees-company-info.component';
import { SiteEmployeesVariationComponent } from './site-employees/site-employees-variation/site-employees-variation.component';
import { SiteEmployeesLeaveRequestApproverComponent } from './site-employees/site-employees-leave-request-approver/site-employees-leave-request-approver.component';
import { SiteEmployeesLeaveApprovalComponent } from './site-employees-leave-approval/site-employees-leave-approval.component';
import { SiteEmployeesLeaveApprovalAvailabilityComponent } from './site-employees-leave-approval/site-employees-leave-approval-availability/site-employees-leave-approval-availability.component';
import { SiteEmployeesLeaveApprovalAvailabilityDayComponent } from './site-employees-leave-approval/site-employees-leave-approval-availability-day/site-employees-leave-approval-availability-day.component';
import { SiteEmployeesLeaveApprovalAvailabilityDayShiftComponent } from './site-employees-leave-approval/site-employees-leave-approval-availability-day-shift/site-employees-leave-approval-availability-day-shift.component';



@NgModule({
  declarations: [
    SiteEmployeesComponent,
    SiteEmployeesEditorComponent,
    NewSiteEmployeesEditorComponent,
    SiteEmployeesAssignmentComponent,
    SiteEmployeesAssignmentScheduleComponent,
    SiteEmployeesAssignmentScheduleDayComponent,
    SiteEmployeesLeaveComponent,
    SiteEmployeesLeaveRowComponent,
    SiteEmployeesLeaveBalanceComponent,
    SiteEmployeesLeaveBalanceDialogComponent,
    SiteEmployeesLeaveBalanceYearComponent,
    SiteEmployeesCompanyInfoComponent,
    SiteEmployeesVariationComponent,
    SiteEmployeesLeaveRequestApproverComponent,
    SiteEmployeesLeaveApprovalComponent,
    SiteEmployeesLeaveApprovalAvailabilityComponent,
    SiteEmployeesLeaveApprovalAvailabilityDayComponent,
    SiteEmployeesLeaveApprovalAvailabilityDayShiftComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    EmployeeModule
  ],
  exports: [
    SiteEmployeesLeaveApprovalComponent
  ]
})
export class SiteEmployeesModule { }
