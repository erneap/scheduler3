import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Employee, IEmployee } from 'src/app/models/employees/employee';
import { Workcode } from 'src/app/models/teams/workcode';
import { IngestManualChange } from 'src/app/models/web/internalWeb';
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
    this.setInputValue();
  }
  get employee(): Employee {
    return this._employee;
  }
  private _date: Date = new Date(0);
  @Input()
  public set date(dt: Date) {
    this._date = new Date(dt);
    this.setInputValue();
  }
  get date(): Date {
    return this._date;
  }
  @Input() leavecodes: Workcode[] = [];
  @Input() width: number = 1158;
  @Output() changed = new EventEmitter<IngestManualChange>();
  dayForm: FormGroup;
  currentValue: string = '';

  constructor(
    protected empService: EmployeeService,
    private fb: FormBuilder
  ) {
    this.dayForm = this.fb.group({
      changedValue: '',
    });
  }

  setInputValue() {
    this.dayForm.controls['changedValue'].setValue(
      this.employee.getIngestValue(this.date));
    this.currentValue = this.employee.getIngestValue(this.date);
  }

  getDisplayValue(): string {
    if (this.employee.id !== '') {
      return this.employee.getIngestValue(this.date);
    }
    return `${this.date.getUTCDate()}`;
  }

  dayStyle(): string {
    const ratio = this.width / 1158;
    let fontSize = ratio * .9;
    if (fontSize < 0.7) {
      fontSize = 0.7;
    }
    let height = Math.floor(25 * ratio);
    let width = Math.floor(29 * ratio);
    let bkColor: string = "ffffff";
    let txColor: string = "000000";
    if (this.employee.id === '') {
      if (this.date.getUTCDay() === 0 || this.date.getUTCDay() === 6) {
        bkColor = "99ccff";
      }
    } else {
      this.leavecodes.forEach(wc => {
        if (wc.id.toLowerCase() === this.currentValue.toLowerCase()) {
          bkColor = wc.backcolor;
          txColor = wc.textcolor;
        }
      });
      if (bkColor === 'ffffff') {
        if (this.date.getUTCDay() === 0 || this.date.getUTCDay() === 6) {
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
    return `width: ${width}px;height: ${height}px;font-size: ${fontSize}rem;`
      + `background-color: #${bkColor};color: #${txColor}`;
  }

  inputStyle(): string {
    const ratio = this.width / 1158;
    let fontSize = ratio * .9;
    if (fontSize < 0.7) {
      fontSize = 0.7;
    }
    let height = Math.floor(24 * ratio);
    let width = Math.floor(28 * ratio);
    let bkColor: string = "ffffff";
    let txColor: string = "000000";
    if (this.employee.id === '') {
      if (this.date.getUTCDay() === 0 || this.date.getUTCDay() === 6) {
        bkColor = "99ccff";
      }
    } else {
      this.leavecodes.forEach(wc => {
        if (wc.id.toLowerCase() === this.currentValue.toLowerCase()) {
          bkColor = wc.backcolor;
          txColor = wc.textcolor;
        }
      });
      if (bkColor === 'ffffff') {
        if (this.date.getUTCDay() === 0 || this.date.getUTCDay() === 6) {
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
    return `width: ${width}px;height: ${height}px;font-size: ${fontSize}rem;`
      + `background-color: #${bkColor};color: #${txColor}`;
  }

  onChange() {
    const numRe = new RegExp("^[0-9]{1,2}(\.[0-9])?$");
    const value = this.dayForm.value.changedValue;
    if (numRe.test(value) && value !== this.currentValue) {
      this.changed.emit(new IngestManualChange(this.employee.id, this.date, value));
    } else if (value.trim() === '' && value !== this.currentValue) {
      this.changed.emit(new IngestManualChange(this.employee.id, this.date, '0'));
    } else if (!numRe.test(value) && value.trim() !== '') {
      let found = false;
      this.leavecodes.forEach(wc => {
        if (wc.id === value) {
          found = true;
        }
      });
      if (found) {
        this.changed.emit(new IngestManualChange(this.employee.id, this.date, value));
      } else {
        alert("Illegal value:  It must be a number or one of the leave codes");
      }
    }
  }
}
