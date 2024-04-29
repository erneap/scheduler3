import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileIngestComponent } from './file-ingest/file-ingest.component';
import { MaterialModule } from '../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SiteIngestMonthComponent } from './site-ingest-month/site-ingest-month.component';
import { SiteIngestMonthEmployeeComponent } from './site-ingest-month/site-ingest-month-employee/site-ingest-month-employee.component';
import { SiteIngestMonthEmployeeDayComponent } from './site-ingest-month/site-ingest-month-employee-day/site-ingest-month-employee-day.component';
import { SiteIngestMonthLegendComponent } from './site-ingest-month/site-ingest-month-legend/site-ingest-month-legend.component';
import { SiteIngestMonthLegendCodeComponent } from './site-ingest-month/site-ingest-month-legend-code/site-ingest-month-legend-code.component';



@NgModule({
  declarations: [
    FileIngestComponent,
    SiteIngestMonthComponent,
    SiteIngestMonthEmployeeComponent,
    SiteIngestMonthEmployeeDayComponent,
    SiteIngestMonthLegendComponent,
    SiteIngestMonthLegendCodeComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    SiteIngestMonthLegendCodeComponent,
    SiteIngestMonthLegendComponent
  ]
})
export class SiteIngestModule { }
