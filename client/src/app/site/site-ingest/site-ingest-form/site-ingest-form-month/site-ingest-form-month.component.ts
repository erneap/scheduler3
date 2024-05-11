import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Assignment } from 'src/app/models/employees/assignments';
import { Employee } from 'src/app/models/employees/employee';
import { ISite, Site } from 'src/app/models/sites/site';
import { Company, ICompany } from 'src/app/models/teams/company';
import { ITeam, Team } from 'src/app/models/teams/team';
import { Workcode } from 'src/app/models/teams/workcode';
import { IngestManualChange } from 'src/app/models/web/internalWeb';
import { IngestResponse } from 'src/app/models/web/siteWeb';
import { AppStateService } from 'src/app/services/app-state.service';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { SiteIngestService } from 'src/app/services/site-ingest.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-site-ingest-form-month',
  templateUrl: './site-ingest-form-month.component.html',
  styleUrls: ['./site-ingest-form-month.component.scss']
})
export class SiteIngestFormMonthComponent {
  @Input() width: number = 1158;
  @Input() height: number = 700;
  private _company: Company = new Company();
  @Input()
  public set company(c: ICompany) {
    this._company = new Company(c);
    this.setEmployees();
  }
  get company(): Company {
    return this._company;
  }
  private _team: Team = new Team();
  @Input()
  public set team(t: ITeam) {
    this._team = new Team(t);
    this.setLeaveCodes();
  }
  get team(): Team {
    return this._team;
  }
  private _site: Site = new Site();
  @Input()
  public set site(s: ISite) {
    this._site = new Site(s);
    this.setEmployees();
  }
  get site(): Site {
    return this._site;
  }
  @Output() monthChanged = new EventEmitter<Date>();
  @Output() manualChanged = new EventEmitter<IngestManualChange>();
  leavecodes: Workcode[] = [];
  monthShown: Date;
  dateForm: FormGroup;
  dates: Date[] = [];
  months: string[] = ['January', 'Febuary', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  employees: Employee[] = [];

  constructor(
    private fb: FormBuilder
  ) {
    const now = new Date();
    this.monthShown = new Date(Date.UTC(now.getFullYear(), now.getMonth(),
      1, 0, 0, 0, 0));
      this.monthChanged.emit(new Date(this.monthShown));
    this.dateForm = this.fb.group({
      month: `${now.getMonth()}`,
      year: now.getFullYear(),
    });
    this.setEmployees();
    this.setMonth();
  }

  setLeaveCodes() {
    this.leavecodes = [];
    this.team.workcodes.forEach(wc => {
      if (wc.isLeave) {
        this.leavecodes.push(new Workcode(wc));
      }
    });
  }

  changeMonth(size: string, direction: string) {
    if (size.toLowerCase() === 'month') {
      if (direction.toLowerCase() === 'up' || direction.toLowerCase() === 'add') {
        this.monthShown = new Date(Date.UTC(this.monthShown.getFullYear(),
          this.monthShown.getMonth() + 1, 1, 0, 0, 0, 0));
      } else {
        this.monthShown = new Date(Date.UTC(this.monthShown.getFullYear(),
          this.monthShown.getMonth() - 1, 1, 0, 0, 0, 0));
      }
    } else {
      // other value is year
      if (direction.toLowerCase() === 'up' || direction.toLowerCase() === 'add') {
        this.monthShown = new Date(Date.UTC(this.monthShown.getFullYear() + 1,
          this.monthShown.getMonth(), 1, 0, 0, 0, 0));
      } else {
        this.monthShown = new Date(Date.UTC(this.monthShown.getFullYear() - 1,
          this.monthShown.getMonth(), 1, 0, 0, 0, 0));
      }
    }
    this.monthChanged.emit(new Date(this.monthShown));
    this.setEmployees();
    this.setMonth();
  }

  monthDirStyle(): string {
    const ratio = this.width / 1158;
    let height = Math.floor(25 * ratio);
    if (height < 15) {
      height = 15;
    }
    return `height: ${height}px;`;
  }

  monthLabelStyle(): string {
    const ratio = this.width / 1158;
    let height = Math.floor(25 * ratio);
    if (height < 15) {
      height = 15;
    }
    return `top: ${height + 1}px;height: ${height}px;`;
  }

  viewStyle(): string {
    const ratio = this.width / 1158;
    let height = Math.floor(25 * ratio);
    if (height < 15) {
      height = 15;
    }
    return `top: ${2 * (height + 1)}px;`;
  }

  selectMonth() {
    const iMonth = Number(this.dateForm.value.month);
    const iYear = Number(this.dateForm.value.year);
    this.monthShown = new Date(Date.UTC(iYear, iMonth, 1, 0, 0, 0, 0));
    this.monthChanged.emit(new Date(this.monthShown));
    this.setEmployees();
    this.setMonth();
  }

  setMonth() {
    this.dates = [];
    let start = new Date(this.monthShown);
    const end = new Date(Date.UTC(start.getFullYear(), start.getMonth() + 1, 1, 
      0, 0, 0, 0));
    while (start.getTime() < end.getTime()) {
      this.dates.push(new Date(start));
      start = new Date(start.getTime() + (24 * 3600000));
    }
  }

  directionStyle(): string {
    const ratio = this.width / 1158;
    let fontSize = ratio;
    if (fontSize < 0.7) {
      fontSize = 0.7;
    }
    let width = Math.floor(100 * ratio);
    if (width < 50) {
      width = 50;
    }
    let height = Math.floor(25 * ratio);
    if (height < 15) {
      height = 15;
    }
    return `width: ${width}px;height: ${height}px;font-size: ${fontSize}rem;`;
  }

  monthStyle(): string {
    const ratio = this.width / 1158;
    let fontSize = ratio;
    if (fontSize < 0.7) {
      fontSize = 0.7;
    }
    let width = Math.floor(100 * ratio);
    if (width < 50) {
      width = 50;
    }
    width = this.width - ((4 * (width + 2)) + 2);
    let height = Math.floor(25 * ratio);
    if (height < 15) {
      height = 15;
    }
    return `width: ${width}px;height: ${height}px;font-size: ${fontSize}rem;`;
  }

  overallStyle(): string {
    const ratio = this.width / 1158;
    let height = Math.floor(25 * ratio);
    height = this.height - ((height + 2) * 2);
    return `width: ${this.width}px;height: ${height}px;`;
  }

  setEmployees() {
    this.employees = [];
    let count = 0;
    if (this.site.employees) {
      const end = new Date(Date.UTC(this.monthShown.getFullYear(), 
        this.monthShown.getMonth() + 1, 1, 0, 0, 0, 0));
      this.site.employees.forEach(emp => {
        if (emp.companyinfo.company.toLowerCase() 
          === this.company.id.toLowerCase()) {
          emp.assignments.sort((a,b) => a.compareTo(b));
          const first = new Assignment(emp.assignments[0]);
          const last = new Assignment(emp.assignments[emp.assignments.length - 1]);
          if (first.startDate.getTime() < end.getTime() 
            && last.endDate.getTime() >= this.monthShown.getTime()) {
            emp.even = (count % 2 === 0);
            this.employees.push(new Employee(emp));
            count++;
          }
        }
      });
    }
  }

  nameWidth(): number {
    const ratio = this.width / 1158;
    let width = Math.floor(150 * ratio)
    return width;
  }

  nameStyle(): string {
    return `width: ${this.nameWidth()}px;`
  }

  nameCellStyle(emp?: Employee): string {
    const ratio = this.width / 1158;
    let fontSize = ratio;
    if (fontSize < 0.7) {
      fontSize = 0.7;
    }
    let height = Math.floor(25 * ratio);
    if (!emp) {
      return `background-color: black;color: white;font-size: ${fontSize}rem;`
        + `width: ${this.nameWidth()}px;height: ${height}px;`;
    } else if (emp.even) {
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
    if (fontSize < 0.7) {
      fontSize = 0.7;
    }
    let height = Math.floor(25 * ratio);
    let width = Math.floor(50 * ratio);
    if (width < 30) width = 30;
    return `background-color: black; color: white;font-size: ${fontSize}rem;`
      + `width: ${width}px;height: ${height}px;`;
  }

  onChanged(change: IngestManualChange) {
    this.manualChanged.emit(change);
  }
}
