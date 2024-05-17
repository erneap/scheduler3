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

@NgModule({
  declarations: [
    TeamEditorComponent,
    TeamEditorWorkcodeComponent,
    TeamEditorCompanyComponent,
    TeamEditorCompanyHolidayComponent,
    TeamEditorCompanyModtimeComponent,
    TeamEditorContacttypesComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    TeamEditorComponent
  ]
})
export class TeamEditorModule { }
