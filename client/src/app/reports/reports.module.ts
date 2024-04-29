import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsComponent } from './reports.component';
import { MaterialModule } from '../material.module';
import { GenericModule } from '../generic/generic.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReportScheduleComponent } from './report-schedule/report-schedule.component';
import { ReportLeaveListComponent } from './report-leave-list/report-leave-list.component';
import { ReportChargeNumberComponent } from './report-charge-number/report-charge-number.component';
import { ReportCertOfServiceComponent } from './report-cert-of-service/report-cert-of-service.component';
import { ReportMidShiftComponent } from './report-mid-shift/report-mid-shift.component';
import { ReportEnterpriseComponent } from './report-enterprise/report-enterprise.component';
import { ReportModTimeComponent } from './report-mod-time/report-mod-time.component';



@NgModule({
  declarations: [
    ReportsComponent,
    ReportScheduleComponent,
    ReportLeaveListComponent,
    ReportChargeNumberComponent,
    ReportCertOfServiceComponent,
    ReportMidShiftComponent,
    ReportEnterpriseComponent,
    ReportModTimeComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    GenericModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ReportsModule { }
