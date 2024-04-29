import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Employee, IEmployee } from 'src/app/models/employees/employee';
import { Workcode } from 'src/app/models/teams/workcode';
import { IngestManualChange } from 'src/app/models/web/internalWeb';

@Component({
  selector: 'app-site-ingest-month-employee',
  templateUrl: './site-ingest-month-employee.component.html',
  styleUrls: ['./site-ingest-month-employee.component.scss']
})
export class SiteIngestMonthEmployeeComponent {
  private _employee: Employee = new Employee();
  private _month: Date = new Date();
  private _ingestType: string = 'manual';
  @Input() 
  public set employee(iEmp: IEmployee) {
    this._employee = new Employee(iEmp);
  }
  get employee(): Employee {
    return this._employee;
  }
  @Input()
  public set month(dt: Date) {
    this._month = new Date(dt);
    this.setDates()
  }
  get month(): Date {
    return this._month;
  }
  @Input()
  public set ingestType(iType: string) {
    this._ingestType = iType;
  }
  get ingestType(): string {
    return this._ingestType;
  }
  @Input() leavecodes: Workcode[] = [];
  @Output() changed = new EventEmitter<IngestManualChange>();
  dates: Date[] = [];

  constructor() {}

  setDates() {
    this.dates = [];
    let start = new Date(Date.UTC(this.month.getUTCFullYear(), 
      this.month.getUTCMonth(), 1));
    while (start.getUTCMonth() === this.month.getUTCMonth()) {
      this.dates.push(start);
      start = new Date(start.getTime() + (24 * 3600000));
    }
  }

  onChange(change: IngestManualChange) {
    this.changed.emit(change);
  }

  getTotal(): string {
    let hours = 0.0;
    this.dates.forEach(dt => {
      const daily = this.employee.getIngestValue(dt);
      let found = false;
      this.leavecodes.forEach(lc => {
        if (daily.toLowerCase() === lc.id.toLowerCase()) {
          found = true;
        }
      });
      if (!found) {
        hours += Number(daily);
      }
    });
    return hours.toFixed(1);
  }
}
