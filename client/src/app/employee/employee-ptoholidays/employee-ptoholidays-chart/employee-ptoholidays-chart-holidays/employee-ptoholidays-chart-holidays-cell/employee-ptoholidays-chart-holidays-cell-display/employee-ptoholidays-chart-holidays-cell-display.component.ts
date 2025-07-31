import { Component, Input } from '@angular/core';
import { ILeaveDay, LeaveDay } from 'src/app/models/employees/leave';

@Component({
    selector: 'app-employee-ptoholidays-chart-holidays-cell-display',
    templateUrl: './employee-ptoholidays-chart-holidays-cell-display.component.html',
    styleUrl: './employee-ptoholidays-chart-holidays-cell-display.component.scss',
    standalone: false
})
export class EmployeePTOHolidaysChartHolidaysCellDisplayComponent {
  private _holiday: LeaveDay = new LeaveDay();
  @Input()
  public set holiday(lv: ILeaveDay) {
    this._holiday = new LeaveDay(lv);
    this.setSpanStyle();
  }
  get holiday(): LeaveDay {
    return this._holiday;
  }
  @Input() comma: boolean = false;
  spanStyle: string = 'color: #000000;';

  constructor() {}

  setSpanStyle() {
    if (this.holiday.status.toLowerCase() !== 'actual') {
      this.spanStyle = 'color: #3399ff;';
    } else {
      this.spanStyle = 'color: #000000;';
    }
  }

  getUTCDateDisplay(): string {
    const months: string[] = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
    return `${this.holiday.leavedate.getUTCDate()}-`
      + `${months[this.holiday.leavedate.getUTCMonth()]}`;
  }
}
