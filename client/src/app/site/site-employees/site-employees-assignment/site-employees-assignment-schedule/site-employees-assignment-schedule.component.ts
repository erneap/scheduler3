import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { WorkWeek } from 'src/app/employee/employee-schedule/employee-schedule.model';
import { DeletionConfirmationComponent } from 'src/app/generic/deletion-confirmation/deletion-confirmation.component';
import { ISchedule, Schedule, Workday } from 'src/app/models/employees/assignments';
import { ISite, Site } from 'src/app/models/sites/site';

@Component({
    selector: 'app-site-employees-assignment-schedule',
    templateUrl: './site-employees-assignment-schedule.component.html',
    styleUrls: ['./site-employees-assignment-schedule.component.scss'],
    standalone: false
})
export class SiteEmployeesAssignmentScheduleComponent {
  private _schedule: Schedule = new Schedule();
  private _startDate: Date | undefined;
  private _endDate: Date | undefined;
  @Input()
  public set schedule(sch: ISchedule) {
    this._schedule = new Schedule(sch);
    this.setSchedule();
  }
  get schedule(): Schedule {
    return this._schedule;
  }
  private _site: Site = new Site();
  @Input()
  public set site(iSite: ISite) {
    this._site = new Site(iSite);
  }
  get site(): Site {
    return this._site;
  }
  @Input()
  public set startdate(sDate: Date | undefined) {
    if (sDate) {
      this._startDate = new Date(sDate);
      this.startid = this._startDate.getUTCDay();
      this.endid = 6;
    } else {
      this._startDate = undefined;
      this.startid = 0;
    }
    this.setSchedule();
  }
  get startdate(): Date | undefined {
    return this._startDate;
  }
  @Input()
  public set enddate(sDate: Date | undefined) {
    if (sDate) {
      this._endDate = new Date(sDate);
      if (this._startDate) {
        const time = this._endDate.getTime() - this._startDate.getTime();
        const days = Math.floor(time / (24 * 3600000)) + 1;
        this.endid = this.startid + days;
        while ((this.endid % 7) > this._endDate.getUTCDay()) {
          this.endid--;
        }
      }
    } else {
      this._endDate = undefined;
    }
    this.setSchedule();
  }
  get enddate(): Date | undefined {
    return this._endDate;
  }
  private _width: number = 700;
  @Input()
  public set width(w: number) {
    if (w > 700) {
      w = 700;
    } else if (w < 700) {
      let dayWidth = Math.floor(w / 7);
      w = dayWidth * 7;
    }
    this._width = w;
  }
  get width(): number {
    return this._width;
  }
  @Input() showdates: boolean = false;
  @Output() change = new EventEmitter<string>();

  days: string[] = [];
  scheduleForm: FormGroup;
  workweeks: WorkWeek[] = [];
  label: string = 'SCHEDULE 0';
  deletable: boolean;
  startid: number = 0;
  endid: number = 7;
  
  constructor(
    private fb: FormBuilder,
    protected dialog: MatDialog
  ) {
    this.days = []
    for (let i = 7; i < 30; i += 7) {
      this.days.push(`${i}`);
    }
    this.scheduleForm = this.fb.group({
      days: '7',
    });
    this.deletable = true;
  }

  setSchedule() {
    this.label = `SCHEDULE ${this.schedule.id}`;
    this.deletable = (this.schedule.id > 0);
    let start = new Date(Date.UTC(2023, 0, 1));
    if (this.startdate) {
      start = new Date(this.startdate);
    }
    while (start.getUTCDay() !== 0) {
      start = new Date(start.getTime() - (24 * 3600000));
    }
    let end = new Date(Date.UTC(2023, 0, 1));
    if (this.enddate) {
      end = new Date(this.enddate);
    }
    while (end.getUTCDay() !== 6) {
      end = new Date(end.getTime() + (24 * 3600000));
    }
    let days = Math.floor((end.getTime() - start.getTime()) / (24 * 3600000));
    while (days % 7 !== 0) {
      days++;
    }
    let weeks = Math.floor(days / 7);
    if (this.schedule.workdays.length % 7 !== 0) {
      weeks++;
    }
    this.scheduleForm.controls['days'].setValue(`${days}`)
    this.workweeks = [];
    for (let i=0; i < weeks; i++) {
      this.workweeks.push(new WorkWeek(i));
    }
    this.schedule.workdays.sort((a,b) => a.compareTo(b));
    for (let i=0; i < days; i++) {
      let week = Math.floor(i / 7);
      const workweek = this.workweeks[week];
      let date = new Date(start.getTime() + (i * 24 * 3600000));
      if (this.startdate) {
        // calculate the position in the array from the startdate
        const iDays = Math.floor((date.getTime() - this.startdate.getTime()) / (24 * 3600000));
        const wd = this.schedule.workdays[iDays];
        wd.id = i;
        wd.date = new Date(date);
        workweek.setWorkday(wd);
      } else {
        if (i < this.schedule.workdays.length) {
          const wd = this.schedule.workdays[i];
          wd.date = new Date(date);
          workweek.setWorkday(wd);
        } else {
          const wd = new Workday();
          wd.id = i;
          wd.date = new Date(date);
          workweek.setWorkday(wd);
        }
      }
    }
    this.startid = 0;
    this.endid = this.startid + (this.schedule.workdays.length - 1);
    if (this.showdates) {
      this.workweeks.forEach(wk => {
        wk.week.forEach(day => {
          if (day.date) {
            if (this.startdate && day.date.getTime() === this.startdate.getTime()) {
              this.startid = day.id;
            }
            if (this.enddate && day.date.getTime() === this.enddate.getTime()) {
              this.endid = day.id;
            }
          }
        })
      });
    }
    this.workweeks.sort((a,b) => a.compareTo(b));
  }

  weekdayStyle(day: number): string {
    let ratio = this.width / 700;
    if (ratio > 1.0) ratio = 1.0;
    const fontSize = ratio * 1.2;
    let bkColor = 'ffffff';
    let txColor = '000000';
    if (day % 7 === 0 || day % 7 === 6) {
      bkColor = '00ffff';
    }
    const width = this.width / 7;
    const height = Math.floor(25 * ratio);
    return `width: ${width}px;height: ${height}px;font-size: ${fontSize}rem;`
      + `background-color: #${bkColor};color: #${txColor};`;
  }

  headerStyle(part: string): string {
    let ratio = this.width / 700;
    if (ratio > 1.0) ratio = 1.0;
    const fontSize = ratio * 1.2;
    const height = Math.floor(48 * ratio);
    let width = this.width / 7;
    if (part === 'month') {
      width = (width * 5) + 8;
    }
    return `width: ${width}px;height: ${height}px;font-size: ${fontSize}rem;`;
  }

  updateDate(data: string) {
    data = `workday|${this.schedule.id}|${data}`;
    this.change.emit(data);
  }

  removeSchedule() {
    const data = `schedule|${this.schedule.id}|0|removeschedule|`;
    this.change.emit(data);
  }

  changeDays() {
    const data = `schedule|${this.schedule.id}|0|changeschedule|`
      + `${this.scheduleForm.value.days}`;
    this.change.emit(data)
  }

  deleteSchedule() {
    const dialogRef = this.dialog.open(DeletionConfirmationComponent, {
      data: {title: 'Confirm Schedule Deletion', 
      message: 'Are you sure you want to delete this schedule?'},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.removeSchedule();
      }
    })
  }

  isDisabled(id: number): boolean {
    const answer =  (id < this.startid || id > this.endid);
    return answer;
  }

  getScheduleDate(id: number): Date | undefined {
    if (this._startDate) {
      let tDate = new Date(this._startDate);
      while (tDate.getUTCDay() !== 0) {
        tDate = new Date(tDate.getTime() - (24 * 3600000));
      }
      tDate.setTime(tDate.getTime() + (id * 24 * 3600000));
      return tDate;
    }
    return undefined;
  }

  setCopy(id: number): boolean {
    let answer: boolean = false;
    const current = this.schedule.workdays[id];
    if (current && (current.hours === 0.0 || current.workcenter === '' 
      || current.code === '')) {
      id--;
      while (!answer && id >= 0) {
        const wd = this.schedule.workdays[id];
        if (wd.code !== '') {
          answer = true;
        }
        id--;
      }
    }
    return answer;
  }
}
