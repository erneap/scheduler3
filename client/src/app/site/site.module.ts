import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';
import { SiteWorkcentersComponent } from './site-workcenters/site-workcenters.component';
import { SiteComponent } from './site.component';
import { NewSiteComponent } from './new-site/new-site.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SiteBasicInformationComponent } from './site-basic-information/site-basic-information.component';
import { SiteForecastReportEditorComponent } from './site-forecast-report-editor/site-forecast-report-editor.component';
import { SiteWorkcenterShiftComponent } from './site-workcenters/site-workcenter-shift/site-workcenter-shift.component';
import { SiteWorkcenterPositionComponent } from './site-workcenters/site-workcenter-position/site-workcenter-position.component';
import { SiteForecastReportPeriodsComponent } from './site-forecast-report-editor/site-forecast-report-periods/site-forecast-report-periods.component';
import { SiteForecastReportLaborCodesComponent } from './site-forecast-report-editor/site-forecast-report-labor-codes/site-forecast-report-labor-codes.component';
import { SiteReportEditorComponent } from './site-report-editor/site-report-editor.component';
import { SiteCofsReportEditorComponent } from './site-cofs-report-editor/site-cofs-report-editor.component';
import { SiteModReportViewComponent } from './site-mod-report-view/site-mod-report-view.component';
import { SiteModReportViewEmployeeComponent } from './site-mod-report-view/site-mod-report-view-employee/site-mod-report-view-employee.component';
import { SiteScheduleModule } from './site-schedule/site-schedule.module';
import { SiteEmployeesModule } from './site-employees/site-employees.module';

@NgModule({
  declarations: [
  
    SiteWorkcentersComponent,
       SiteComponent,
       NewSiteComponent,
       SiteBasicInformationComponent,
       SiteForecastReportEditorComponent,
       SiteWorkcenterShiftComponent,
       SiteWorkcenterPositionComponent,
       SiteForecastReportPeriodsComponent,
       SiteForecastReportLaborCodesComponent,
       SiteReportEditorComponent,
       SiteCofsReportEditorComponent,
       SiteModReportViewComponent,
       SiteModReportViewEmployeeComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    SiteScheduleModule,
    SiteEmployeesModule
  ],
  exports: [
    SiteComponent,
    NewSiteComponent,
  ]
})
export class SiteModule { }
