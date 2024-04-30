import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteEditorComponent } from './site-editor.component';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SiteEditorWorkcenterComponent } from './site-editor-workcenter/site-editor-workcenter.component';
import { SiteEditorWorkcenterPositionComponent } from './site-editor-workcenter/site-editor-workcenter-position/site-editor-workcenter-position.component';
import { SiteEditorWorkcenterShiftComponent } from './site-editor-workcenter/site-editor-workcenter-shift/site-editor-workcenter-shift.component';


@NgModule({
  declarations: [
    SiteEditorComponent,
    SiteEditorWorkcenterComponent,
    SiteEditorWorkcenterPositionComponent,
    SiteEditorWorkcenterShiftComponent
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
