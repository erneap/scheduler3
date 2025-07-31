import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ILeaveDay, LeaveDay } from 'src/app/models/employees/leave';
import { Workcode } from 'src/app/models/teams/workcode';

@Component({
    selector: 'app-employee-leave-request-editor-calendar-week',
    templateUrl: './employee-leave-request-editor-calendar-week.component.html',
    styleUrls: ['./employee-leave-request-editor-calendar-week.component.scss'],
    standalone: false
})
export class EmployeeLeaveRequestEditorCalendarWeekComponent {
  private _weekdays: LeaveDay[] = [];
  @Input()
  public set weekdays(days: ILeaveDay[]) {
    this._weekdays = [];
    days.forEach(day => {
      this._weekdays.push(new LeaveDay(day));
    });
    this._weekdays.sort((a,b) => a.compareTo(b));
  }
  get weekdays(): LeaveDay[] {
    return this._weekdays;
  }
  @Input() leavecodes: Workcode[] = [];
  @Input() width: number = 700;
  @Input() start: Date = new Date();
  @Input() end: Date = new Date();
  @Output() changed = new EventEmitter<string>();

  showDay(lvDate: Date): boolean {
    return (lvDate.getTime() >= this.start.getTime() 
      && lvDate.getTime() <= this.end.getTime());
  }

  dayChanged(chg: string) {
    this.changed.emit(chg);
  }
}
