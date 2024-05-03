import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteEditorComponent } from './site-editor.component';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SiteEditorWorkcenterComponent } from './site-editor-workcenter/site-editor-workcenter.component';
import { SiteEditorWorkcenterPositionComponent } from './site-editor-workcenter/site-editor-workcenter-position/site-editor-workcenter-position.component';
import { SiteEditorWorkcenterShiftComponent } from './site-editor-workcenter/site-editor-workcenter-shift/site-editor-workcenter-shift.component';
import { SiteEditorReportsComponent } from './site-editor-reports/site-editor-reports.component';
import { SiteEditorReportsForecastComponent } from './site-editor-reports/site-editor-reports-forecast/site-editor-reports-forecast.component';
import { SiteEditorReportsCofsComponent } from './site-editor-reports/site-editor-reports-cofs/site-editor-reports-cofs.component';
import { SiteEditorReportsForecastPeriodComponent } from './site-editor-reports/site-editor-reports-forecast/site-editor-reports-forecast-period/site-editor-reports-forecast-period.component';
import { SiteEditorReportsForecastLaborComponent } from './site-editor-reports/site-editor-reports-forecast/site-editor-reports-forecast-labor/site-editor-reports-forecast-labor.component';
import { SiteEditorReportsCofsDescriptorComponent } from './site-editor-reports/site-editor-reports-cofs/site-editor-reports-cofs-descriptor/site-editor-reports-cofs-descriptor.component';
import { SiteEditorReportsCofsDescriptorCompanyComponent } from './site-editor-reports/site-editor-reports-cofs/site-editor-reports-cofs-descriptor/site-editor-reports-cofs-descriptor-company/site-editor-reports-cofs-descriptor-company.component';
import { SiteEditorReportsCofsDescriptorSectionComponent } from './site-editor-reports/site-editor-reports-cofs/site-editor-reports-cofs-descriptor/site-editor-reports-cofs-descriptor-section/site-editor-reports-cofs-descriptor-section.component';

@NgModule({
  declarations: [
    SiteEditorComponent,
    SiteEditorWorkcenterComponent,
    SiteEditorWorkcenterPositionComponent,
    SiteEditorWorkcenterShiftComponent,
    SiteEditorReportsComponent,
    SiteEditorReportsForecastComponent,
    SiteEditorReportsCofsComponent,
    SiteEditorReportsForecastPeriodComponent,
    SiteEditorReportsForecastLaborComponent,
    SiteEditorReportsCofsDescriptorComponent,
    SiteEditorReportsCofsDescriptorCompanyComponent,
    SiteEditorReportsCofsDescriptorSectionComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    SiteEditorComponent
  ]
})
export class SiteEditorModule { }
