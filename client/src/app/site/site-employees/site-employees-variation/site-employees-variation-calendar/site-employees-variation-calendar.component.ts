import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { WorkWeek } from 'src/app/employee/employee-schedule/employee-schedule.model';
import { IVariation, Variation, Workday } from 'src/app/models/employees/assignments';
import { ISite, Site } from 'src/app/models/sites/site';

@Component({
    selector: 'app-site-employees-variation-calendar',
    templateUrl: './site-employees-variation-calendar.component.html',
    styleUrl: './site-employees-variation-calendar.component.scss',
    standalone: false
})
export class SiteEmployeesVariationCalendarComponent {
  private _variation: Variation = new Variation();
  @Input()
  public set variation(iVar: IVariation) {
    this._variation = new Variation(iVar);
    this.setSchedule();
  }
  get variation(): Variation {
    return this._variation;
  }
  private _site: Site = new Site();
  @Input()
  public set site(iSite: ISite) {
    this._site = new Site(iSite);
  }
  get site(): Site {
    return this._site;
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
  @Output() change = new EventEmitter<string>();

  days: string[] = [];
  scheduleForm: FormGroup;
  workweeks: WorkWeek[] = [];
  label: string = 'SCHEDULE';
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
    this.workweeks = [];
    var workweek: WorkWeek | undefined = undefined;
    var weeks = 0;
    if (this.variation.schedule.showdates) {
      var count = 0;
      var start = new Date(this.variation.startdate);
      var end = new Date(this.variation.enddate);
      while (start.getUTCDay() !== 0) {
        start = new Date(start.getTime() - (24 * 3600000));
      }
      while (end.getUTCDay() !== 6) {
        end = new Date(end.getTime() + (24 * 3600000));
      }
      var days = Math.floor((end.getTime() - start.getTime()) / (24 * 3600000))
      while (days % 7 !== 0) {
        days++;
      }
      if (days !== this.variation.schedule.workdays.length) {
        const data = `schedule|${this.variation.schedule.id}|0|changeschedule|`
          + `${days}`;
        this.change.emit(data)
      }
      while (start.getTime() <= end.getTime()) {
        if (!workweek || start.getUTCDay() === 0) {
          workweek = new WorkWeek(weeks);
          this.workweeks.push(workweek);
          weeks++
        }
        var workday = new Workday();
        workday.id = count;
        workday.date = new Date(start);
        var wd = new Workday();
        if (count < this.variation.schedule.workdays.length) {
          wd = this.variation.schedule.workdays[count];
        }
        workday.code = wd.code;
        workday.hours = wd.hours;
        workday.workcenter = wd.workcenter;
        workday.disable = !(start.getTime() >= this.variation.startdate.getTime() 
          && start.getTime() <= this.variation.enddate.getTime())
        workweek.setWorkday(workday);
        count++;
        start = new Date(start.getTime() + (24 * 3600000));
      }
    } else {
      this.variation.schedule.workdays.sort((a,b) => a.compareTo(b))
      this.variation.schedule.workdays.forEach(wd => {
        if (!workweek || wd.id % 7 === 0) {
          workweek = new WorkWeek(weeks);
          this.workweeks.push(workweek);
          weeks++;
        }
        workweek.setWorkday(wd);
      });
    }
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
    data = `workday|${this.variation.schedule.id}|${data}`;
    this.change.emit(data);
  }

  changeDays() {
    const data = `schedule|${this.variation.schedule.id}|0|changeschedule|`
      + `${this.scheduleForm.value.days}`;
    this.change.emit(data)
  }

  setCopy(id: number): boolean {
    let answer: boolean = false;
    const current = this.variation.schedule.workdays[id];
    if (current && (current.hours === 0.0 || current.workcenter === '' 
      || current.code === '')) {
      id--;
      while (!answer && id >= 0) {
        const wd = this.variation.schedule.workdays[id];
        if (wd.code !== '') {
          answer = true;
        }
        id--;
      }
    }
    return answer;
  }
}
