import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IWorkday, Workday } from 'src/app/models/employees/assignments';
import { ISite, Site } from 'src/app/models/sites/site';
import { Workcenter } from 'src/app/models/sites/workcenter';
import { Workcode } from 'src/app/models/teams/workcode';
import { ChangeAssignmentRequest } from 'src/app/models/web/employeeWeb';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-site-employee-assignment-schedule-day',
  templateUrl: './site-employee-assignment-schedule-day.component.html',
  styleUrls: ['./site-employee-assignment-schedule-day.component.scss']
})
export class SiteEmployeeAssignmentScheduleDayComponent {
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
  private _useDate: Date | undefined;
  @Input()
  public set usedate(tDate: Date | undefined) {
    if (tDate) {
      this._useDate = new Date(tDate);
    } else {
      this._useDate = undefined;
    }
  }
  get usedate(): Date | undefined {
    return this._useDate;
  }
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
    if (this.usedate) {
      return this.usedate.getDate().toString(10);
    }
    return this.workday.id.toString(10);
  }
}
