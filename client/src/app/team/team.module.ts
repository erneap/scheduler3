import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SiteModule } from '../site/site.module';
import { NewTeamComponent } from './new-team/new-team.component';
import { TeamComponent } from './team.component';
import { SiteEmployeesModule } from '../site/site-employees/site-employees.module';
import { TeamEditorModule } from './team-editor/team-editor.module';

@NgModule({
  declarations: [
    NewTeamComponent,
    TeamComponent,
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
