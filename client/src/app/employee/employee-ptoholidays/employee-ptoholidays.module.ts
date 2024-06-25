import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeePtoholidaysComponent } from './employee-ptoholidays.component';
import { EmployeePTOHolidaysChartComponent } from './employee-ptoholidays-chart/employee-ptoholidays-chart.component';
import { EmployeePTOHolidaysChartPTOComponent } from './employee-ptoholidays-chart/employee-ptoholidays-chart-pto/employee-ptoholidays-chart-pto.component';
import { EmployeePTOHolidaysChartHolidaysComponent } from './employee-ptoholidays-chart/employee-ptoholidays-chart-holidays/employee-ptoholidays-chart-holidays.component';
import { EmployeePTOHolidaysChartPTOMonthComponent } from './employee-ptoholidays-chart/employee-ptoholidays-chart-pto/employee-ptoholidays-chart-ptomonth/employee-ptoholidays-chart-ptomonth.component';
import { EmployeePTOHolidaysChartHolidaysCellComponent } from './employee-ptoholidays-chart/employee-ptoholidays-chart-holidays/employee-ptoholidays-chart-holidays-cell/employee-ptoholidays-chart-holidays-cell.component';
import { EmployeePTOHolidaysChartHolidaysCellDisplayComponent } from './employee-ptoholidays-chart/employee-ptoholidays-chart-holidays/employee-ptoholidays-chart-holidays-cell/employee-ptoholidays-chart-holidays-cell-display/employee-ptoholidays-chart-holidays-cell-display.component';
import { EmployeePTOHolidaysChartPTOMonthDatesComponent } from './employee-ptoholidays-chart/employee-ptoholidays-chart-pto/employee-ptoholidays-chart-ptomonth/employee-ptoholidays-chart-ptomonth-dates/employee-ptoholidays-chart-ptomonth-dates.component';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    EmployeePtoholidaysComponent,
    EmployeePTOHolidaysChartComponent,
    EmployeePTOHolidaysChartPTOComponent,
    EmployeePTOHolidaysChartHolidaysComponent,
    EmployeePTOHolidaysChartPTOMonthComponent,
    EmployeePTOHolidaysChartHolidaysCellComponent,
    EmployeePTOHolidaysChartHolidaysCellDisplayComponent,
    EmployeePTOHolidaysChartPTOMonthDatesComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    EmployeePtoholidaysComponent,
    EmployeePTOHolidaysChartComponent
  ]
})
export class EmployeePTOHolidaysModule { }
