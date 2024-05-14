import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TeamListEditorComponent } from './team-list-editor/team-list-editor.component';
import { TeamModule } from '../team/team.module';
import { DataPurgeComponent } from './data-purge/data-purge.component';
import { TeamEditorModule } from '../team/team-editor/team-editor.module';

@NgModule({
  declarations: [
    TeamListEditorComponent,
    DataPurgeComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    TeamModule,
    TeamEditorModule
  ]
})
export class AdminActionsModule { }
