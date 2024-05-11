import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Employee, IEmployee } from 'src/app/models/employees/employee';
import { Workcode } from 'src/app/models/teams/workcode';
import { IngestManualChange } from 'src/app/models/web/internalWeb';

@Component({
  selector: 'app-site-ingest-form-month-employee',
  templateUrl: './site-ingest-form-month-employee.component.html',
  styleUrls: ['./site-ingest-form-month-employee.component.scss']
})
export class SiteIngestFormMonthEmployeeComponent {
  @Input() ingest: string = 'manual';
  private _employee: Employee = new Employee();
  @Input() 
  public set employee(e: IEmployee) {
    this._employee = new Employee(e);
  }
  get employee(): Employee {
    return this._employee;
  }
  @Input() dates: Date[] = [];
  @Input() leavecodes: Workcode[] = [];
  @Input() width: number = 1158;
  @Output() changed = new EventEmitter<IngestManualChange>();

  nameWidth(): number {
    const ratio = this.width / 1158;
    let width = Math.floor(150 * ratio);
    return width;
  }

  nameStyle(): string {
    return `width: ${this.nameWidth()}px;`
  }

  nameCellStyle(): string {
    const ratio = this.width / 1158;
    let fontSize = ratio;
    if (fontSize < .7) fontSize = .7;
    let height = Math.floor(25 * ratio);
    if (this.employee.even) {
      return `background-color: #c0c0c0;color: black;font-size: ${fontSize}rem;`
        + `width: ${this.nameWidth()}px;height: ${height}px;`;
    } else {
      return `background-color: white;color: black;font-size: ${fontSize}rem;`
        + `width: ${this.nameWidth()}px;height: ${height}px;`;
    }
  }

  daysStyle(): string {
    let width = this.width - (this.nameWidth() + 2); 
    return `width: ${width}px;`;
  }

  totalsStyle(): string {
    const ratio = this.width / 1158;
    let fontSize = ratio;
    if (fontSize < .7) fontSize = .7;
    let height = Math.floor(25 * ratio);
    let width = Math.floor(50 * ratio);
    if (this.employee.even) {
      return `background-color: #c0c0c0;color: black;font-size: ${fontSize}rem;`
        + `width: ${width}px;height: ${height}px;`;
    } else {
      return `background-color: white;color: black;font-size: ${fontSize}rem;`
        + `width: ${width}px;height: ${height}px;`;
    }
  }

  totalsValue(): string {
    let work = 0.0;
    this.dates.forEach(date => {
      if (this.employee.work) {
        this.employee.work.forEach(wk => {
          if (wk.dateWorked.getTime() === date.getTime() && !wk.modtime) {
            work += wk.hours;
          }
        })
      }
    });
    if (work.toFixed(1).indexOf('.0') >= 0) {
      return work.toFixed(0);
    }
    return work.toFixed(1);
  }

  onChange(change: IngestManualChange) {
    this.changed.emit(change)
  }
}
