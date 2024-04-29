import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogViewerComponent } from './log-viewer.component';
import { MaterialModule } from '../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LogEntryComponent } from './log-entry/log-entry.component';



@NgModule({
  declarations: [
    LogViewerComponent,
    LogEntryComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class LogViewerModule { }
