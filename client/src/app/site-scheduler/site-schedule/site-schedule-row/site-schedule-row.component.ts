import { Component, Input } from '@angular/core';
import { Workday } from 'src/app/models/employees/assignments';
import { Employee, IEmployee } from 'src/app/models/employees/employee';

@Component({
  selector: 'app-site-schedule-row',
  templateUrl: './site-schedule-row.component.html',
  styleUrls: ['./site-schedule-row.component.scss']
})
export class SiteScheduleRowComponent {
  private _employee: Employee = new Employee();
  private _month: Date = new Date();
  @Input()
  public set employee(emp: IEmployee) {
    this._employee = new Employee(emp);
    this.setMonth()
  }
  get employee(): Employee {
    return this._employee;
  }
  @Input()
  public set index(ind: number) {
    if ((ind % 2) === 0) {
      this.baseClass = 'background-color: white; color: black;';
    } else {
      this.baseClass = 'background-color: lightgray;color: black;';
    }
  }
  @Input()
  public set month(dt: Date) {
    this._month = new Date(dt);
    this.setMonth();
  }
  get month(): Date {
    return this._month;
  }
  private _last: Date = new Date(0);
  @Input()
  public set lastWorked(last: Date) {
    this._last = new Date(last);
    this.setMonth();
  }
  get lastWorked(): Date {
    return this._last;
  }
  baseClass: string = 'background-color: white; color: black;';
  workdays: Workday[] = [];
  dates: Date[] = [];
  startDate: Date = new Date();
  endDate: Date = new Date();

  constructor() {}

  setMonth() {
    this.workdays = [];
    this.dates = [];
    this.startDate = new Date(Date.UTC(this.month.getFullYear(), 
      this.month.getMonth(), 1, 0, 0, 0));
    this.endDate = new Date(Date.UTC(this.month.getFullYear(), 
      this.month.getMonth() + 1, 1, 0, 0, 0));
    
    let start = new Date(this.startDate);

    this.dates = [];
    while (start.getTime() < this.endDate.getTime()) {
      this.dates.push(new Date(start));
      const wd = this.employee.getWorkday(this.employee.site, start, 
        this.lastWorked);
      if (wd) {
        this.workdays.push(new Workday(wd));
      } else {
        this.workdays.push(new Workday());
      }
      start = new Date(start.getTime() + (24 * 3600000));
    }
  }
}
