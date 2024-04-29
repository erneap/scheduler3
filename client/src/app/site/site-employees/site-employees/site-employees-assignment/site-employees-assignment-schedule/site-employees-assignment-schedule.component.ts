import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { WorkWeek } from 'src/app/employee/employee-schedule/employee-schedule.model';
import { DeletionConfirmationComponent } from 'src/app/generic/deletion-confirmation/deletion-confirmation.component';
import { ISchedule, Schedule } from 'src/app/models/employees/assignments';
import { ISite, Site } from 'src/app/models/sites/site';

@Component({
  selector: 'app-site-employees-assignment-schedule',
  templateUrl: './site-employees-assignment-schedule.component.html',
  styleUrls: ['./site-employees-assignment-schedule.component.scss']
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
      this.startid = this._startDate.getDay();
      this.endid = 6;
    } else {
      this._startDate = undefined;
      this.startid = 0;
    }
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
        while ((this.endid % 7) > this._endDate.getDay()) {
          this.endid--;
        }
      }
    } else {
      this._endDate = undefined;
    }
  }
  get enddate(): Date | undefined {
    return this._endDate;
  }
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
    this.scheduleForm.controls['days'].setValue(`${this.schedule.workdays.length}`)
    this.workweeks = [];
    this.schedule.workdays.sort((a,b) => a.compareTo(b));
    var workweek: WorkWeek | undefined;
    let count = -1;
    for (let i=0; i < this.schedule.workdays.length; i++) {
      if (!workweek || (i % 7) === 0) {
        count++;
        workweek = new WorkWeek(count);
        this.workweeks.push(workweek);
      }
      let date = new Date(2023, 0, i + 1);
      workweek.setWorkday(this.schedule.workdays[i], date);
    }
    this.startid = 0;
    this.endid = this._schedule.workdays.length - 1;
    this.workweeks.sort((a,b) => a.compareTo(b));
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
      while (tDate.getDay() !== 0) {
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
    if (current.hours === 0.0 || current.workcenter === '' || current.code === '') {
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
