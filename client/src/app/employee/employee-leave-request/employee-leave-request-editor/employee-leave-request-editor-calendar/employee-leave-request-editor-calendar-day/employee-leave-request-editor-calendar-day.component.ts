import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ILeaveDay, LeaveDay } from 'src/app/models/employees/leave';
import { Workcode } from 'src/app/models/teams/workcode';

@Component({
  selector: 'app-employee-leave-request-editor-calendar-day',
  templateUrl: './employee-leave-request-editor-calendar-day.component.html',
  styleUrls: ['./employee-leave-request-editor-calendar-day.component.scss']
})
export class EmployeeLeaveRequestEditorCalendarDayComponent {
  private _leaveDay: LeaveDay = new LeaveDay();
  @Input()
  public set leaveday(lv: ILeaveDay) {
    this._leaveDay = new LeaveDay(lv);
    this.setLeave();
  }
  get leaveday(): LeaveDay {
    return this._leaveDay;
  }
  @Input() show: boolean = true;
  @Input() width: number = 700;
  @Input() leavecodes: Workcode[] = [];
  @Output() changed = new EventEmitter<string>()

  dayForm: FormGroup;

  constructor(
    private fb: FormBuilder
  ) {
    this.dayForm = this.fb.group({
      code: '',
      hours: ''
    });
  }

  setLeave() {
    this.dayForm.controls['code'].setValue(this.leaveday.code);
    if (this.leaveday.hours.toFixed(1).indexOf(".0") >= 0) {
      this.dayForm.controls['hours'].setValue(this.leaveday.hours.toFixed(0));
    } else {
      this.dayForm.controls['hours'].setValue(this.leaveday.hours.toFixed(1));
    }
  }

  dayStyle(): string {
    let ratio = this.width / 700;
    if (ratio > 1.0) ratio = 1.0;
    const width = Math.floor(100 * ratio);
    let answer = `height: ${width}px;width: ${width}px;`;
    if (!this.show) {
      answer += 'background-color: #000000;color: #000000;';
    } else {
      let found = false;
      this.leavecodes.forEach(lc => {
        if (lc.id.toLowerCase() === this.leaveday.code.toLowerCase()) {
          found = true;
          answer += `background-color: #${lc.backcolor};`
            + `color: #${lc.textcolor};`;
        }
      });
      if (!found) {
        answer += `background-color: #ffffff;color: #000000;`;
      }
    }
    return answer;
  }

  dayOfWeekStyle(): string {
    let ratio = this.width / 700;
    if (ratio > 1.0) ratio = 1.0;
    const fontSize = 1.2 * ratio;
    const width = Math.floor(25 * ratio);
    return `width: ${width}px;height: ${width}px;font-size: ${fontSize}rem;`;
  }

  getCodeStyle(): string {
    let ratio = this.width / 700;
    if (ratio > 1.0) ratio = 1.0;
    let bkColor = 'ffffff';
    let txColor = '000000';
    if (!this.show) {
      bkColor = '000000';
      txColor = '000000';
    } else if (this.leaveday && this.leaveday.code !== "") {
      this.leavecodes.forEach(lc => {
        if (lc.id.toLowerCase() === this.leaveday.code.toLowerCase()) {
          bkColor = lc.backcolor;
          txColor = lc.textcolor;
        }
      });
    }
    return `background-color: #${bkColor};color: #${txColor};`
      + `font-size: ${ratio * 1.3}rem;`;
  }

  getHoursStyle(): string {
    let ratio = this.width / 700;
    if (ratio > 1.0) ratio = 1.0;
    let bkColor = 'ffffff';
    let txColor = '000000';
    if (!this.show) {
      bkColor = '000000';
      txColor = '000000';
    } else if (this.leaveday && this.leaveday.code !== "") {
      this.leavecodes.forEach(lc => {
        if (lc.id.toLowerCase() === this.leaveday.code.toLowerCase()) {
          bkColor = lc.backcolor;
          txColor = lc.textcolor;
        }
      });
    }
    return `background-color: #${bkColor};color: #${txColor};`
      + `font-size: ${ratio}rem;width: ${ratio * 50}px;`;
  }

  getFormFont(): string {
    let ratio = this.width / 700;
    if (ratio > 1.0) ratio = 1.0;
    return `font-size: ${ratio}rem;`
  }

  changeCode() {
    this.leaveday.code = this.dayForm.value.code;
    this.leaveday.hours = Number(this.dayForm.value.hours);
    let data: string = `${this.leaveday.leavedate.getFullYear()}-`
      + ((this.leaveday.leavedate.getMonth() < 9) ? '0' : '') 
      + `${this.leaveday.leavedate.getMonth() + 1}-`
      + ((this.leaveday.leavedate.getDate() < 10) ? '0' : '') 
      + `${this.leaveday.leavedate.getDate()}`
      + `|${this.leaveday.code}|${this.leaveday.hours}`;
    this.changed.emit(data);
    this.setLeave();
  }

  optionStyle(code: string): string {
    let answer = 'background-color: white;color: black;';
    this.leavecodes.forEach(cd => {
      if (cd.id.toLowerCase() === code.toLowerCase()) {
        answer = `background-color: #${cd.backcolor};color: #${cd.textcolor};`;
      }
    });
    return answer;
  }
}
