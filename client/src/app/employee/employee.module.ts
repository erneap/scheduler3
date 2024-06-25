import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeScheduleComponent } from './employee-schedule/employee-schedule.component';
import { MaterialModule } from '../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmployeeScheduleDayComponent } from './employee-schedule/employee-schedule-day/employee-schedule-day.component';
import { EmployeeScheduleMonthComponent } from './employee-schedule/employee-schedule-month/employee-schedule-month.component';
import { EmployeeHomeComponent } from './employee-home/employee-home.component';
import { EmployeeProfileComponent } from './employee-profile/employee-profile.component';
import { EmployeeProfileFormComponent } from './employee-profile/employee-profile-form/employee-profile-form.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { NotificationsMessageComponent } from './notifications/notifications-message/notifications-message.component';
import { EmployeeContactInfoComponent } from './employee-contact-info/employee-contact-info.component';
import { EmployeeContactInfoItemComponent } from './employee-contact-info/employee-contact-info-item/employee-contact-info-item.component';
import { EmployeeSpecialtiesComponent } from './employee-specialties/employee-specialties.component';
import { EmployeeLeaveRequestModule } from './employee-leave-request/employee-leave-request.module';
import { EmployeePTOHolidaysModule } from './employee-ptoholidays/employee-ptoholidays.module';
import { EmployeePtoholidaysComponent } from './employee-ptoholidays/employee-ptoholidays.component';
import { EmployeePTOHolidaysChartComponent } from './employee-ptoholidays/employee-ptoholidays-chart/employee-ptoholidays-chart.component';

@NgModule({
  declarations: [
    EmployeeScheduleComponent,
    EmployeeScheduleDayComponent,
    EmployeeScheduleMonthComponent,
    EmployeeHomeComponent,
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
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    EmployeeLeaveRequestModule,
    EmployeePTOHolidaysModule
  ],
  exports: [
    EmployeeProfileFormComponent,
    EmployeeContactInfoComponent,
    EmployeeContactInfoItemComponent,
    EmployeeSpecialtiesComponent,
    EmployeePtoholidaysComponent,
    EmployeePTOHolidaysChartComponent
  ]
})
export class EmployeeModule { }
