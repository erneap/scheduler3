import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamEditorComponent } from './team-editor.component';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TeamEditorWorkcodeComponent } from './team-editor-workcode/team-editor-workcode.component';

@NgModule({
  declarations: [
    TeamEditorComponent,
    TeamEditorWorkcodeComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class TeamEditorModule { }
