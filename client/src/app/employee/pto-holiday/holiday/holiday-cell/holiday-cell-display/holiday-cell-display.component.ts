import { Component, Input } from '@angular/core';
import { ILeaveDay, LeaveDay } from 'src/app/models/employees/leave';

@Component({
  selector: 'app-holiday-cell-display',
  templateUrl: './holiday-cell-display.component.html',
  styleUrls: ['./holiday-cell-display.component.scss']
})
export class HolidayCellDisplayComponent {
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

  getDateDisplay(): string {
    const months: string[] = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
    return `${this.holiday.leavedate.getDate()}-${months[this.holiday.leavedate.getMonth()]}`;
  }
}
