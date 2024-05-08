import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Employee, IEmployee } from 'src/app/models/employees/employee';
import { Workcode } from 'src/app/models/teams/workcode';
import { EmployeeService } from 'src/app/services/employee.service';

@Component({
  selector: 'app-site-ingest-form-month-employee-day',
  templateUrl: './site-ingest-form-month-employee-day.component.html',
  styleUrls: ['./site-ingest-form-month-employee-day.component.scss']
})
export class SiteIngestFormMonthEmployeeDayComponent {
  @Input() ingest: string = 'manual';
  private _employee: Employee = new Employee();
  @Input() 
  public set employee(e: IEmployee) {
    this._employee = new Employee(e);
  }
  get employee(): Employee {
    return this._employee;
  }
  private _date: Date = new Date(0);
  @Input()
  public set date(dt: Date) {
    this._date = new Date(dt);
  }
  get date(): Date {
    return this._date;
  }
  @Input() leavecodes: Workcode[] = [];
  @Input() width: number = 1135;
  @Output() changed = new EventEmitter<Employee>();
  dayForm: FormGroup;
  dayValue: string = '';

  constructor(
    protected empService: EmployeeService,
    private fb: FormBuilder
  ) {
    this.dayForm = this.fb.group({
      day: '',
    });
  }

  dayStyle(): string {
    const ratio = this.width / 1135;
    const fontSize = (this.width <= 15) ? 9 : Math.floor(12 * ratio);
    let height = Math.floor(25 * ratio);
    if (height < 15) {
      height = 15;
    }
    let bkColor: string = "ffffff";
    let txColor: string = "000000";
    if (this.employee.id === '') {
      if (this.date.getDay() === 0 || this.date.getDay() === 6) {
        bkColor = "99ccff";
      }
    } else {
      let lwork: Date = new Date(0);
      if (this.employee.work) {
        this.employee.work.sort((a,b) => a.compareTo(b));
        lwork = new Date(this.employee.work[this.employee.work.length - 1].dateWorked);
      }
      const wd = this.employee.getWorkday(this.employee.site, this.date, lwork);
      this.leavecodes.forEach(wc => {
        if (wc.id.toLowerCase() === wd.code.toLowerCase()) {
          bkColor = wc.backcolor;
          txColor = wc.textcolor;
        }
      });
      if (bkColor === 'ffffff') {
        if (this.date.getDay() === 0 || this.date.getDay() === 6) {
          if (this.employee.even) {
            bkColor = '3399ff';
          } else {
            bkColor = '99ccff';
          }
        } else {
          if (this.employee.even) {
            bkColor = 'c0c0c0';
          } else {
            bkColor = 'ffffff';
          }
        }
      }
    }
    return `width: ${height}px;height: ${height}px;font-size: ${fontSize}pt;`
      + `background-color: #${bkColor};color: #${txColor}`;
  }

  setDay() {

  }
}
