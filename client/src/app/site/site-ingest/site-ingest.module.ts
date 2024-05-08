import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteIngestComponent } from './site-ingest.component';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SiteScheduleModule } from '../site-schedule/site-schedule.module';
import { SiteIngestFormComponent } from './site-ingest-form/site-ingest-form.component';
import { SiteIngestFormMonthComponent } from './site-ingest-form/site-ingest-form-month/site-ingest-form-month.component';
import { SiteIngestFormMonthEmployeeComponent } from './site-ingest-form/site-ingest-form-month/site-ingest-form-month-employee/site-ingest-form-month-employee.component';
import { SiteIngestFormMonthEmployeeDayComponent } from './site-ingest-form/site-ingest-form-month/site-ingest-form-month-employee-day/site-ingest-form-month-employee-day.component';

@NgModule({
  declarations: [
  
    SiteIngestComponent,
       SiteIngestFormComponent,
       SiteIngestFormMonthComponent,
       SiteIngestFormMonthEmployeeComponent,
       SiteIngestFormMonthEmployeeDayComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    SiteScheduleModule
  ],
  exports: [
    SiteIngestComponent
  ]
})
export class SiteIngestModule { }
