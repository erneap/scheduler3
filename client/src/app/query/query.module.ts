import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QueryComponent } from './query.component';
import { MaterialModule } from '../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QueryContactsComponent } from './query-contacts/query-contacts.component';
import { QuerySpecialtiesComponent } from './query-specialties/query-specialties.component';

@NgModule({
  declarations: [
    QueryComponent,
    QueryContactsComponent,
    QuerySpecialtiesComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class QueryModule { }
