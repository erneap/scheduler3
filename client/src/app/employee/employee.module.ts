import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeScheduleComponent } from './employee-schedule/employee-schedule.component';
import { MaterialModule } from '../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmployeeScheduleDayComponent } from './employee-schedule/employee-schedule-day/employee-schedule-day.component';
import { EmployeeScheduleMonthComponent } from './employee-schedule/employee-schedule-month/employee-schedule-month.component';
import { EmployeeRoutingModule } from './employee-routing.module';
import { EmployeeHomeComponent } from './employee-home/employee-home.component';
import { PtoHolidayComponent } from './pto-holiday/pto-holiday.component';
import { HolidayComponent } from './pto-holiday/holiday/holiday.component';
import { HolidayCellComponent } from './pto-holiday/holiday/holiday-cell/holiday-cell.component';
import { HolidayCellDisplayComponent } from './pto-holiday/holiday/holiday-cell/holiday-cell-display/holiday-cell-display.component';
import { PtoComponent } from './pto-holiday/pto/pto.component';
import { PtoMonthComponent } from './pto-holiday/pto/pto-month/pto-month.component';
import { PtoMonthDatesDisplayComponent } from './pto-holiday/pto/pto-month/pto-month-dates-display/pto-month-dates-display.component';
import { PtoHolidayChartComponent } from './pto-holiday/pto-holiday-chart/pto-holiday-chart.component';
import { EmployeeProfileComponent } from './employee-profile/employee-profile.component';
import { EmployeeProfileFormComponent } from './employee-profile/employee-profile-form/employee-profile-form.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { NotificationsMessageComponent } from './notifications/notifications-message/notifications-message.component';
import { EmployeeContactInfoComponent } from './employee-contact-info/employee-contact-info.component';
import { EmployeeContactInfoItemComponent } from './employee-contact-info/employee-contact-info-item/employee-contact-info-item.component';
import { EmployeeSpecialtiesComponent } from './employee-specialties/employee-specialties.component';
import { EmployeeLeaveRequestModule } from './employee-leave-request/employee-leave-request.module';

@NgModule({
  declarations: [
    EmployeeScheduleComponent,
    EmployeeScheduleDayComponent,
    EmployeeScheduleMonthComponent,
    EmployeeHomeComponent,
    PtoHolidayComponent,
    HolidayComponent,
    HolidayCellComponent,
    HolidayCellDisplayComponent,
    PtoComponent,
    PtoMonthComponent,
    PtoMonthDatesDisplayComponent,
    PtoHolidayChartComponent,
    EmployeeProfileComponent,
    EmployeeProfileFormComponent,
    NotificationsComponent,
    NotificationsMessageComponent,
    EmployeeContactInfoComponent,
    EmployeeContactInfoItemComponent,
    EmployeeSpecialtiesComponent
  ],
  imports: [
    CommonModule,
    EmployeeRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    EmployeeLeaveRequestModule
  ],
  exports: [
    PtoHolidayChartComponent,
    EmployeeProfileFormComponent,
    EmployeeContactInfoComponent,
    EmployeeContactInfoItemComponent,
    EmployeeSpecialtiesComponent
  ]
})
export class EmployeeModule { }
