import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';
import { SiteComponent } from './site.component';
import { NewSiteComponent } from './new-site/new-site.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SiteModReportViewComponent } from './site-mod-report-view/site-mod-report-view.component';
import { SiteScheduleModule } from './site-schedule/site-schedule.module';
import { SiteEmployeesModule } from './site-employees/site-employees.module';
import { SiteEditorModule } from './site-editor/site-editor.module';
import { SiteIngestModule } from './site-ingest/site-ingest.module';
import { SiteModReportViewChartComponent } from './site-mod-report-view/site-mod-report-view-chart/site-mod-report-view-chart.component';
import { SiteModReportViewChartMonthComponent } from './site-mod-report-view/site-mod-report-view-chart/site-mod-report-view-chart-month/site-mod-report-view-chart-month.component';

@NgModule({
  declarations: [
    SiteComponent,
    NewSiteComponent,
    SiteModReportViewComponent,
    SiteModReportViewChartComponent,
    SiteModReportViewChartMonthComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    SiteScheduleModule,
    SiteEmployeesModule,
    SiteEditorModule,
    SiteIngestModule
  ],
  exports: [
    SiteComponent,
    NewSiteComponent,
    SiteModReportViewComponent
  ]
})
export class SiteModule { }
