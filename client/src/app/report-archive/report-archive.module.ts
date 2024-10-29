import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportArchiveComponent } from './report-archive.component';
import { MaterialModule } from '../material.module';
import { GenericModule } from '../generic/generic.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReportArchiveFileComponent } from './report-archive-file/report-archive-file.component';



@NgModule({
  declarations: [
    ReportArchiveComponent,
    ReportArchiveFileComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    GenericModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ReportArchiveModule { }
