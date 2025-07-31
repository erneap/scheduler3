import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IWorkday, Workday } from 'src/app/models/employees/assignments';
import { ISite, Site } from 'src/app/models/sites/site';
import { Workcenter } from 'src/app/models/sites/workcenter';
import { Workcode } from 'src/app/models/teams/workcode';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
    selector: 'app-site-employees-assignment-schedule-day',
    templateUrl: './site-employees-assignment-schedule-day.component.html',
    styleUrls: ['./site-employees-assignment-schedule-day.component.scss'],
    standalone: false
})
export class SiteEmployeesAssignmentScheduleDayComponent {
  dayStyle: string = 'background-color: white; color: black;';
  fontStyle: string = 'background-color: white !important;'
    + 'color: #000000 !important;';
  private _workday: Workday = new Workday();
  @Input()
  public set workday(wd: IWorkday) {
    this._workday = new Workday(wd);
    this.setDay();
  }
  get workday(): Workday {
    return this._workday;
  }
  private _site: Site = new Site();
  @Input()
  public set site(iSite: ISite) {
    this._site = new Site(iSite);
    this.setWorkcenters();
  }
  get site(): Site {
    return this._site;
  }
  @Input() showdates: boolean = false;
  private _disabled: boolean = false;
  @Input() 
  public set disabled(bval: boolean) {
    this._disabled = bval;
    this.setDay();
  }
  get disabled(): boolean {
    return this._disabled;
  }
  private _copy: boolean = false;
  @Input()
  public set copy(bval: boolean) {
    this._copy = bval;
  }
  get copy(): boolean {
    return this._copy;
  }
  @Input() width: number = 700;
  @Output() changedate = new EventEmitter<string>();
  workCodes: Workcode[] = [];
  workcenters: Workcenter[] = [];
  workHours: string[] = new Array("", "2", "3", "4", "6", "8", "10", "12");
  dayForm: FormGroup;

  constructor(
    protected teamService: TeamService,
    protected siteService: SiteService,
    private fb: FormBuilder
  ) {
    this.workCodes = [];
    const team = this.teamService.getTeam();
    if (team) {
      team.workcodes.forEach(wc => {
        if (!wc.isLeave) {
          this.workCodes.push(new Workcode(wc));
        }
      });
    }
    const site = this.siteService.getSite();
    if (site) {
      this.site = site;
      this.setWorkcenters();
    }
    this.dayForm = this.fb.group({
      code: '',
      workcenter: '',
      hours: '',
    });
  }

  setWorkcenters() {
    this.workcenters = [];
    if (this.site.workcenters) {
      this.site.workcenters.forEach(wc => {
        this.workcenters.push(new Workcenter(wc));
      })
    }
  }

  setDay() {
    this.dayForm.controls["code"].setValue(this.workday.code);
    this.dayForm.controls["workcenter"].setValue(this.workday.workcenter);
    this.dayForm.controls["hours"].setValue(`${this.workday.hours}`);
    if (this.disabled) {
      this.dayStyle = 'background-color: black; color: black;';
      this.fontStyle = 'background-color: black !important;'
      + 'color: black !important;';
    } else {
      this.workCodes.forEach(wc => {
        if (wc.id.toLowerCase() === this.workday.code.toLowerCase()) {
          this.dayStyle = `background-color: #${wc.backcolor};`
            + `color:#${wc.textcolor};`;
        }
      });
    }
  }

  changeField(field: string) {
    let value: string = '';
    switch (field.toLowerCase()) {
      case "code":
        value = this.dayForm.value.code;
        break;
      case "workcenter":
        value = this.dayForm.value.workcenter;
        break;
      case "hours":
        value = this.dayForm.value.hours;
        break;
    }
    const data = `${this.workday.id}|${field}|${value}`;
    this.changedate.emit(data);
  }

  getDisplayDate(): string {
    if (this.showdates && this.workday.date) {
      return this.workday.date.getUTCDate().toString(10);
    }
    return this.workday.id.toString(10);
  }

  dayOfWeekStyle(): string {
    let ratio = this.width / 700;
    if (ratio > 1.0) ratio = 1.0;
    const fontSize = 1.2 * ratio;
    let height = Math.floor(25 * ratio);
    return `width: ${height}px;width: ${height}px;font-size: ${fontSize}rem;`;
  }

  cellStyle(): string {
    let ratio = this.width / 700;
    if (ratio > 1.0) ratio = 1.0;
    const fontSize = 1.2 * ratio;
    let height = Math.floor(100 * ratio);
    let bkColor = 'ffffff';
    let txColor = '000000';
    let code = this.dayForm.value.code;
    if (this.disabled) {
      bkColor = '000000';
      txColor = '000000';
    } else {
      this.workCodes.forEach(wc => {
        if (wc.id.toLowerCase() === code.toLowerCase()) {
          bkColor = wc.backcolor;
          txColor = wc.textcolor;
        }
      });
    }
    return `height: ${height}px;width: ${height}px;font-size: ${fontSize}rem;`
      + `background-color: #${bkColor};color: #${txColor};`;
  }

  inputStyle(field: string): string {
    let bkColor = 'ffffff';
    let txColor = '000000';
    let ratio = this.width / 700;
    const fontSize = 1.2 * ratio;
    let top = 25;
    let height = Math.floor(22 * ratio);
    let code = this.dayForm.value.code;
    if (this.disabled) {
      bkColor = '000000';
      txColor = '000000';
    } else {
      this.workCodes.forEach(wc => {
        if (wc.id.toLowerCase() === code.toLowerCase()) {
          bkColor = wc.backcolor;
          txColor = wc.textcolor;
        }
      });
    }
    switch (field.toLowerCase()) {
      case "code":
        top = Math.floor(25 * ratio);
        break;
      case 'workcenter':
        top = Math.floor(50 * ratio);
        break;
      case 'hours':
        top = Math.floor(75 * ratio);
        break;
    }
    return `top: ${top}px;height: ${height}px;font-size: ${fontSize}rem;`
      + `background-color: #${bkColor};color: #${txColor};`
  }
}
