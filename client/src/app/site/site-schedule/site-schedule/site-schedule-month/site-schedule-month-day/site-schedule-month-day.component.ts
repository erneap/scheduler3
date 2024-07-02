import { Component, Input } from '@angular/core';
import { Employee, IEmployee } from 'src/app/models/employees/employee';
import { Workcode } from 'src/app/models/teams/workcode';
import { AppStateService } from 'src/app/services/app-state.service';

@Component({
  selector: 'app-site-schedule-month-day',
  templateUrl: './site-schedule-month-day.component.html',
  styleUrls: ['./site-schedule-month-day.component.scss']
})
export class SiteScheduleMonthDayComponent {
  @Input() workcodes: Workcode[] = [];
  private _employee: Employee = new Employee();
  @Input()
  public set employee(emp: IEmployee) {
    this._employee = new Employee(emp);
  }
  get employee(): Employee {
    return this._employee;
  }
  private _date: Date = new Date();
  @Input()
  public set date(dt: Date) {
    this._date = new Date(dt);
  }
  get date(): Date {
    return this._date;
  }
  @Input() width: number = 25;
  @Input() viewtype: string = 'label';

  constructor(
    protected appState: AppStateService
  ) {

  }

  dayStyle(): string {
    const ratio = this.width / 25;
    const fontSize = (this.width <= 15) ? 9 : Math.floor(12 * ratio);
    let bkColor: string = "ffffff";
    let txColor: string = "000000";
    if (this.employee.id === '') {
      if (this.date.getUTCDay() === 0 || this.date.getUTCDay() === 6) {
        bkColor = "99ccff";
      }
    } else {
      let lwork: Date = new Date(0);
      if (this.employee.work) {
        this.employee.work.sort((a,b) => a.compareTo(b));
        lwork = new Date(this.employee.work[this.employee.work.length - 1].dateWorked);
      }
      const wd = this.employee.getWorkday(this.employee.site, this.date, lwork);
      this.workcodes.forEach(wc => {
        if (wc.id.toLowerCase() === wd.code.toLowerCase()) {
          bkColor = wc.backcolor;
          txColor = wc.textcolor;
        }
      });
      if (bkColor === 'ffffff') {
        if (this.date.getUTCDay() === 0 || this.date.getUTCDay() === 6) {
          if (this.viewtype === 'even') {
            bkColor = '3399ff';
          } else {
            bkColor = '99ccff';
          }
        } else {
          if (this.viewtype === 'even') {
            bkColor = 'c0c0c0';
          } else {
            bkColor = 'ffffff';
          }
        }
      }
    }
    return `width: ${this.width}px;height: ${this.width}px;font-size: ${fontSize}pt;`
      + `background-color: #${bkColor};color: #${txColor}`;
  }

  dayValue(): string {
    const weekdays = new Array("Su", "Mo", "Tu", "We", "Th", "Fr", "Sa");
    if (this.viewtype === 'label' || this.viewtype === 'day' ) {
      if (this.viewtype === 'label') {
        return `${this.date.getUTCDate()}`;
      } 
      return weekdays[this.date.getUTCDay()];
    }
    let lwork: Date = new Date(0);
    if (this.employee.work) {
      this.employee.work.sort((a,b) => a.compareTo(b));
      lwork = new Date(this.employee.work[this.employee.work.length - 1].dateWorked);
    }
    const wd = this.employee.getWorkday(this.employee.site, this.date, lwork);
    return wd.code;
  }
}
