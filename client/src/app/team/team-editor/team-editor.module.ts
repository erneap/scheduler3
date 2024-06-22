import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamEditorComponent } from './team-editor.component';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TeamEditorWorkcodeComponent } from './team-editor-workcode/team-editor-workcode.component';
import { TeamEditorCompanyComponent } from './team-editor-company/team-editor-company.component';
import { TeamEditorCompanyHolidayComponent } from './team-editor-company/team-editor-company-holiday/team-editor-company-holiday.component';
import { TeamEditorCompanyModtimeComponent } from './team-editor-company/team-editor-company-modtime/team-editor-company-modtime.component';
import { TeamEditorContacttypesComponent } from './team-editor-contacttypes/team-editor-contacttypes.component';
import { TeamEditorSpecialtytypesComponent } from './team-editor-specialtytypes/team-editor-specialtytypes.component';
import { TeamEditorSiteEditorComponent } from './team-editor-site-editor/team-editor-site-editor.component';
import { SiteModule } from 'src/app/site/site.module';
import { TeamEditorSiteEditorNewSiteComponent } from './team-editor-site-editor/team-editor-site-editor-new-site/team-editor-site-editor-new-site.component';
import { SiteEditorModule } from 'src/app/site/site-editor/site-editor.module';
import { SiteEmployeesModule } from 'src/app/site/site-employees/site-employees.module';
import { TeamEditorSitesComponent } from './team-editor-sites/team-editor-sites.component';

@NgModule({
  declarations: [
    TeamEditorComponent,
    TeamEditorWorkcodeComponent,
    TeamEditorCompanyComponent,
    TeamEditorCompanyHolidayComponent,
    TeamEditorCompanyModtimeComponent,
    TeamEditorContacttypesComponent,
    TeamEditorSpecialtytypesComponent,
    TeamEditorSiteEditorComponent,
    TeamEditorSiteEditorNewSiteComponent,
    TeamEditorSitesComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    SiteModule,
    SiteEditorModule,
    SiteEmployeesModule
  ],
  exports: [
    TeamEditorComponent
  ]
})
export class TeamEditorModule { }
