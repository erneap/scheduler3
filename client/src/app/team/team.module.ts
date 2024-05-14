import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamSiteEmployeeEditorComponent } from './team-site-employee-editor/team-site-employee-editor.component';
import { MaterialModule } from '../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TeamSiteEditorComponent } from './team-site-editor/team-site-editor.component';
import { SiteModule } from '../site/site.module';
import { TeamCompanyComponent } from './team-company/team-company.component';
import { TeamCompanyHolidaysComponent } from './team-company/team-company-holidays/team-company-holidays.component';
import { NewTeamComponent } from './new-team/new-team.component';
import { TeamComponent } from './team.component';
import { TeamContactListComponent } from './team-contact-list/team-contact-list.component';
import { TeamSpecialtiesListComponent } from './team-specialties-list/team-specialties-list.component';
import { TeamCompanyModtimeComponent } from './team-company/team-company-modtime/team-company-modtime.component';
import { SiteEmployeesModule } from '../site/site-employees/site-employees.module';
import { TeamEditorModule } from './team-editor/team-editor.module';

@NgModule({
  declarations: [
    TeamSiteEmployeeEditorComponent,
    TeamSiteEditorComponent,
    TeamCompanyComponent,
    TeamCompanyHolidaysComponent,
    NewTeamComponent,
    TeamComponent,
    TeamContactListComponent,
    TeamSpecialtiesListComponent,
    TeamCompanyModtimeComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    SiteModule,
    FormsModule,
    ReactiveFormsModule,
    SiteEmployeesModule,
    TeamEditorModule
  ],
  exports: [
    NewTeamComponent
  ]
})
export class TeamModule { }
