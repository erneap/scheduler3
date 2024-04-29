import { Component, Input } from '@angular/core';
import { Employee, IEmployee } from 'src/app/models/employees/employee';
import { Workcode } from 'src/app/models/teams/workcode';

@Component({
  selector: 'app-site-schedule-month-days',
  templateUrl: './site-schedule-month-days.component.html',
  styleUrls: ['./site-schedule-month-days.component.scss']
})
export class SiteScheduleMonthDaysComponent {
  @Input() workcodes: Workcode[] = [];
  private _employee: Employee = new Employee();
  @Input()
  public set employee(emp: IEmployee) {
    this._employee = new Employee(emp);
  }
  get employee(): Employee {
    return this._employee;
  }
  private _dates: Date[] = [];
  @Input()
  public set dates(dt: Date[]) {
    this._dates = [];
    dt.forEach(d => {
      this._dates.push(new Date(d));
    })
  }
  get dates(): Date[] {
    return this._dates
  }
  @Input() viewtype: string = 'label';
  @Input() width: number = 25;
}
