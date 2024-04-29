import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TeamListEditorComponent } from './team-list-editor/team-list-editor.component';
import { TeamModule } from '../team/team.module';
import { DataPurgeComponent } from './data-purge/data-purge.component';

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
    TeamModule
  ]
})
export class AdminActionsModule { }
