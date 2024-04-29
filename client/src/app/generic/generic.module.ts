import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonListComponent } from './button-list/button-list.component';
import { ButtonDivComponent } from './button-list/button-div/button-div.component';
import { NoticeDialogComponent } from './notice-dialog/notice-dialog.component';
import { MaterialModule } from '../material.module';



@NgModule({
  declarations: [
    ButtonListComponent,
    ButtonDivComponent,
    NoticeDialogComponent
  ],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [
    ButtonListComponent,
    ButtonDivComponent
  ]
})
export class GenericModule { }
