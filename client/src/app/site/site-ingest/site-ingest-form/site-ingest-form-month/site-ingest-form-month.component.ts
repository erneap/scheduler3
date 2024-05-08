import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Assignment } from 'src/app/models/employees/assignments';
import { Employee } from 'src/app/models/employees/employee';
import { ISite, Site } from 'src/app/models/sites/site';
import { Company, ICompany } from 'src/app/models/teams/company';
import { Team } from 'src/app/models/teams/team';
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
  @Input() width: number = 1048;
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
  @Input() team: Team = new Team();
  private _site: Site = new Site();
  @Input()
  public set site(s: ISite) {
    this._site = new Site(s);
    console.log(`Form: ${this.site.employees?.length}`);
    this.setEmployees();
  }
  get site(): Site {
    return this._site;
  }
  @Output() monthChanged = new EventEmitter<Date>();
  monthShown: Date;
  dateForm: FormGroup;
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
  }

  selectMonth() {
    const iMonth = Number(this.dateForm.value.month);
    const iYear = Number(this.dateForm.value.year);
    this.monthShown = new Date(Date.UTC(iYear, iMonth, 1, 0, 0, 0, 0));
    this.monthChanged.emit(new Date(this.monthShown));
    this.setEmployees();
  }

  directionStyle(): string {
    const ratio = this.width / 1135;
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
    const ratio = this.width / 1135;
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
    const ratio = this.width / 1135;
    let height = Math.floor(25 * ratio);
    if (height < 15) {
      height = 15;
    }
    height = this.height - ((height + 2) * 2);
    return `width: ${this.width}px;height: ${height}px;`;
  }

  setEmployees() {
    this.employees = [];
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
            this.employees.push(new Employee(emp));
          }
        }
      });
    }
    for (let i = 0; i < this.employees.length; i++) {
      this.employees[i].even = (i % 2 === 0);
    }
  }

  nameWidth(): number {
    const ratio = this.width / 1135;
    let width = Math.floor(200 * ratio)
    if (width < 150) {
      width = 150;
    }
    return width;
  }

  nameStyle(): string {
    return `width: ${this.nameWidth()}px;`
  }

  nameCellStyle(emp?: Employee): string {
    const ratio = this.width / 1135;
    let fontSize = Math.floor(12 * ratio);
    if (fontSize < 9) fontSize = 9;
    let height = Math.floor(25 * ratio);
    if (height < 15) {
      height = 15;
    }
    if (!emp) {
      return `background-color: black;color: white;font-size: ${fontSize}pt;`
        + `width: ${this.nameWidth()}px;height: ${height}px;`;
    } else if (emp.even) {
      return `background-color: #c0c0c0;color: black;font-size: ${fontSize}pt;`
        + `width: ${this.nameWidth()}px;height: ${height}px;`;
    } else {
      return `background-color: white;color: black;font-size: ${fontSize}pt;`
        + `width: ${this.nameWidth()}px;height: ${height}px;`;
    }
  }

  daysStyle(): string {
    let width = this.width - (this.nameWidth() + 2); 
    return `width: ${width}px;`;
  }
}
