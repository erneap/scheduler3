import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteScheduleComponent } from './site-schedule/site-schedule.component';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SiteScheduleMonthComponent } from './site-schedule/site-schedule-month/site-schedule-month.component';
import { SiteScheduleMonthDayComponent } from './site-schedule/site-schedule-month/site-schedule-month-day/site-schedule-month-day.component';
import { SiteScheduleMonthOfficeComponent } from './site-schedule/site-schedule-month/site-schedule-month-office/site-schedule-month-office.component';
import { SiteScheduleMonthDaysComponent } from './site-schedule/site-schedule-month/site-schedule-month-days/site-schedule-month-days.component';
import { SiteScheduleLegendComponent } from './site-schedule/site-schedule-legend/site-schedule-legend.component';
import { SiteScheduleLegendCodeComponent } from './site-schedule/site-schedule-legend/site-schedule-legend-code/site-schedule-legend-code.component';
import { SiteScheduleCoverageComponent } from './site-schedule-coverage/site-schedule-coverage.component';
import { SiteScheduleCoverageDayComponent } from './site-schedule-coverage/site-schedule-coverage-day/site-schedule-coverage-day.component';
import { SiteScheduleCoverageWorkcenterComponent } from './site-schedule-coverage/site-schedule-coverage-workcenter/site-schedule-coverage-workcenter.component';
import { SiteScheduleCoverageDaysComponent } from './site-schedule-coverage/site-schedule-coverage-days/site-schedule-coverage-days.component';
import { SiteScheduleCoverageMonthComponent } from './site-schedule-coverage/site-schedule-coverage-month/site-schedule-coverage-month.component';
import { SiteScheduleMidsListComponent } from './site-schedule-mids-list/site-schedule-mids-list.component';


@NgModule({
  declarations: [
    SiteScheduleComponent,
    SiteScheduleMonthComponent,
    SiteScheduleMonthDayComponent,
    SiteScheduleMonthOfficeComponent,
    SiteScheduleMonthDaysComponent,
    SiteScheduleLegendComponent,
    SiteScheduleLegendCodeComponent,
    SiteScheduleCoverageComponent,
    SiteScheduleCoverageDayComponent,
    SiteScheduleCoverageWorkcenterComponent,
    SiteScheduleCoverageDaysComponent,
    SiteScheduleCoverageMonthComponent,
    SiteScheduleMidsListComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    SiteScheduleComponent,
    SiteScheduleCoverageComponent,
    SiteScheduleMidsListComponent,
    SiteScheduleLegendComponent,
    SiteScheduleLegendCodeComponent
  ]
})
export class SiteScheduleModule { }
