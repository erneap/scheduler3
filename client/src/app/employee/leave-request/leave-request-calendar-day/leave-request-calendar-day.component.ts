import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ILeaveDay, LeaveDay } from 'src/app/models/employees/leave';
import { Workcode } from 'src/app/models/teams/workcode';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-leave-request-calendar-day',
  templateUrl: './leave-request-calendar-day.component.html',
  styleUrls: ['./leave-request-calendar-day.component.scss']
})
export class LeaveRequestCalendarDayComponent {
  private _leave: LeaveDay | undefined;
  private _start: Date | undefined;
  private _end: Date | undefined;
  @Input()
  public set leave(lv: ILeaveDay) {
    this._leave = new LeaveDay(lv);
    this.setLeave();
  }
  get leave(): LeaveDay {
    if (this._leave) {
      return this._leave;
    }
    return new LeaveDay();
  }
  @Input() 
  public set startDate(start: Date){
    this._start = new Date(start);
  }
  get startDate(): Date {
    if (this._start) {
      return this._start;
    }
    return new Date();
  }
  @Input()
  public set endDate(end: Date) {
    this._end = new Date(end);
  }
  get endDate(): Date {
    if (this._end) {
      return this._end;
    }
    return new Date();
  }
  @Input() leavecodes: Workcode[] = []
  @Input() width = 100;
  @Output() changed = new EventEmitter<string>();

  dayForm: FormGroup;
  dayStyle: string = 'background-color: black; color: black;';
  fontStyle: string = 'background-color: white !important;'
    + 'color: #000000 !important;';

  constructor(
    private fb: FormBuilder,
    protected teamService: TeamService
  ) {
    this.dayForm = this.fb.group({
      code: '',
      hours: '',
    });
  }

  setLeave() {
    this.dayForm.controls['code'].setValue(this.leave.code);
    if (this.leave.hours > 0) {
      this.dayForm.controls['hours'].setValue(this.leave.hours.toFixed(1));
    } else {
      this.dayForm.controls['hours'].setValue("");
    }
  }

  getDateClass() : string {
    const today = new Date();
    let classes = 'dayOfMonth ';
    if (this.leave && this.leave.leavedate) {
      if (today.getFullYear() === this.leave.leavedate.getUTCFullYear() 
        && today.getMonth() === this.leave.leavedate.getUTCMonth()
        && today.getDate() === this.leave.leavedate.getUTCDate()) {
        classes += "today";
      } else if (this.leave.leavedate.getUTCDay() === 0 
        || this.leave.leavedate.getUTCDay() === 6) {
        classes += "weekend";
      } else {
        classes += "weekday";
      }
    } else {
      classes += "weekday";
    }
    return classes;
  }

  getDateStyles(): string {
    if (this.width > 100) {
      this.width = 100;
    }
    const cWidth = (this.width / 4);
    const fontSize = 1.1 * (cWidth / 25);
    return `height: ${cWidth}px;width: ${cWidth}px;font-size: ${fontSize}em;`;
  }

  getWorkdayStyle(): string {
    if (this.width > 100) {
      this.width = 100;
    }
    let bkColor = 'ffffff';
    let txColor = '000000';
    if (this.leave && this.leave.code !== "") {
      // find the workcode setting from the team
      const team = this.teamService.getTeam()
      if (team) {
        let found = false;
        for (let i=0; i < team.workcodes.length && !found; i++) {
          let wc: Workcode = team.workcodes[i];
          if (wc.id.toLowerCase() === this.leave.code.toLowerCase()) {
            found = true;
            bkColor = wc.backcolor;
            txColor = wc.textcolor;
            if (wc.backcolor.toLowerCase() === 'ffffff' 
              && (this.leave.leavedate.getTime() < this.startDate.getTime()
              || this.leave.leavedate.getTime() > this.endDate.getTime()) )  {
              bkColor = '000000';
              txColor = '000000';
            }
          }
        }
      }
    } else if (this.leave.leavedate.getTime() < this.startDate.getTime()
      || this.leave.leavedate.getTime() > this.endDate.getTime()) {
      bkColor = '000000';
      txColor = '000000';
    } else {
      bkColor = 'ffffff';
      txColor = '000000';
    }
    const style = `height: ${this.width}px;width: ${this.width}px;`
      + `background-color: #${bkColor};color: #${txColor};`;
    return style;
  }

  getCodeStyle(): string {
    const ratio = this.width / 100;
    let txColor = '000000';
    if (this.leave && this.leave.code !== "") {
      // find the workcode setting from the team
      const team = this.teamService.getTeam()
      if (team) {
        let found = false;
        for (let i=0; i < team.workcodes.length && !found; i++) {
          let wc: Workcode = team.workcodes[i];
          if (wc.id.toLowerCase() === this.leave.code.toLowerCase()) {
            found = true;
            txColor = wc.textcolor;
            if (wc.backcolor.toLowerCase() === 'ffffff' 
              && (this.leave.leavedate.getTime() < this.startDate.getTime()
              || this.leave.leavedate.getTime() > this.endDate.getTime()) )  {
              txColor = '000000';
            }
          }
        }
      }
    } else if (this.leave.leavedate.getTime() < this.startDate.getTime()
      || this.leave.leavedate.getTime() > this.endDate.getTime()) {
      txColor = '000000';
    } else {
      txColor = '000000';
    }
    const style = `color: #${txColor};font-size: ${ratio * 1.3}rem;`;
    return style;
  }

  getHoursStyle(): string {
    const ratio = this.width / 100;
    let txColor = '000000';
    if (this.leave && this.leave.code !== "") {
      // find the workcode setting from the team
      const team = this.teamService.getTeam()
      if (team) {
        let found = false;
        for (let i=0; i < team.workcodes.length && !found; i++) {
          let wc: Workcode = team.workcodes[i];
          if (wc.id.toLowerCase() === this.leave.code.toLowerCase()) {
            found = true;
            txColor = wc.textcolor;
            if (wc.backcolor.toLowerCase() === 'ffffff' 
              && (this.leave.leavedate.getTime() < this.startDate.getTime()
              || this.leave.leavedate.getTime() > this.endDate.getTime()) )  {
              txColor = '000000';
            }
          }
        }
      }
    } else if (this.leave.leavedate.getTime() < this.startDate.getTime()
      || this.leave.leavedate.getTime() > this.endDate.getTime()) {
      txColor = '000000';
    } else {
      txColor = '000000';
    }
    const style = `color: #${txColor};font-size: ${ratio}rem;width: ${ratio * 50}px;`;
    return style;
  }

  getFormFont(): string {
    const ratio = this.width / 100;
    return `font-size: ${ratio}rem;`
  }

  changeCode() {
    this.leave.code = this.dayForm.value.code;
    this.leave.hours = Number(this.dayForm.value.hours);
    let data: string = `${this.leave.leavedate.getFullYear()}-`
      + ((this.leave.leavedate.getMonth() < 9) ? '0' : '') 
      + `${this.leave.leavedate.getMonth() + 1}-`
      + ((this.leave.leavedate.getDate() < 10) ? '0' : '') 
      + `${this.leave.leavedate.getDate()}`
      + `|${this.leave.code}|${this.leave.hours}`;
    this.changed.emit(data);
    this.setLeave();
  }
}
