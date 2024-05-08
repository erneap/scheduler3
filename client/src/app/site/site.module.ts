import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';
import { SiteComponent } from './site.component';
import { NewSiteComponent } from './new-site/new-site.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SiteModReportViewComponent } from './site-mod-report-view/site-mod-report-view.component';
import { SiteModReportViewEmployeeComponent } from './site-mod-report-view/site-mod-report-view-employee/site-mod-report-view-employee.component';
import { SiteScheduleModule } from './site-schedule/site-schedule.module';
import { SiteEmployeesModule } from './site-employees/site-employees.module';
import { SiteEditorModule } from './site-editor/site-editor.module';
import { SiteIngestModule } from './site-ingest/site-ingest.module';

@NgModule({
  declarations: [
    SiteComponent,
    NewSiteComponent,
    SiteModReportViewComponent,
    SiteModReportViewEmployeeComponent
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
