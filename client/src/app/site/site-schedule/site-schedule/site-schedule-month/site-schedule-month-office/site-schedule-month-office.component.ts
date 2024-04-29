import { Component, Input } from '@angular/core';
import { Employee, IEmployee } from 'src/app/models/employees/employee';
import { ISite, Site } from 'src/app/models/sites/site';
import { IWorkcenter, Workcenter } from 'src/app/models/sites/workcenter';
import { Workcode } from 'src/app/models/teams/workcode';
import { AppStateService } from 'src/app/services/app-state.service';

@Component({
  selector: 'app-site-schedule-month-office',
  templateUrl: './site-schedule-month-office.component.html',
  styleUrls: ['./site-schedule-month-office.component.scss']
})
export class SiteScheduleMonthOfficeComponent {
  private _site: Site = new Site();
  @Input()
  public set site(isite: ISite) {
    this._site = new Site(isite);
    this.setEmployees();
  }
  get site(): Site {
    return this._site;
  }
  private _workcenter: Workcenter = new Workcenter();
  @Input()
  public set workcenter(iWc: IWorkcenter) {
    this._workcenter = new Workcenter(iWc);
  }
  get workcenter(): Workcenter {
    return this._workcenter;
  }
  private _month: Date = new Date();
  @Input()
  public set month(dt: Date) {
    this._month = new Date(dt);
    this.setMonth();
    this.setEmployees();
  }
  get month(): Date {
    return this._month;
  }
  @Input() workcodes: Workcode[] = [];
  
  monthDays: Date[] = [];
  count: number = -2;
  width: number = 25;

  constructor(
    protected appState: AppStateService
  ) {}

  setMonth() {
    this.monthDays = [];
    let start = new Date(Date.UTC(this.month.getFullYear(), 
      this.month.getMonth(), 1));
    const end = new Date(Date.UTC(this.month.getFullYear(), 
      this.month.getMonth() + 1, 1));
    while (start.getTime() < end.getTime()) {
      this.monthDays.push(new Date(start));
      start = new Date(start.getTime() + (24 * 3600000));
    }
  }

  setEmployees() {
    const wkctrMap = new Map<string, number>();
    this.workcenter.clearEmployees();
    if (this.site.employees) {
      this.site.employees.forEach(iEmp => {
        const emp = new Employee(iEmp);
        // figure workcenter to include this employee, based on workcenter
          // individual works the most
          wkctrMap.clear();
          let start = new Date(Date.UTC(this.month.getUTCFullYear(), 
            this.month.getUTCMonth(), 1));
          this.monthDays.forEach(dt => {
            const wd = emp.getWorkdayWOLeaves(this.site.id, dt);
            if (wd.workcenter !== '') {
              let cnt = wkctrMap.get(wd.workcenter);
              if (cnt) {
                cnt++;
                wkctrMap.set(wd.workcenter, cnt);
              } else {
                cnt = 1;
                wkctrMap.set(wd.workcenter, cnt);
              }
            }
          }); 
          let wkctr = '';
          let count = 0;
          for (let key of wkctrMap.keys()) {
            let cnt = wkctrMap.get(key);
            if (cnt) {
              if (cnt > count) {
                count = cnt;
                wkctr = key;
              }
            }
          }
          if (wkctr.toLowerCase() === this.workcenter.id.toLowerCase()) {
            this.workcenter.addEmployee(emp, this.month);
          }
      });
    }
    let count = -1;
    if (this.workcenter.positions && this.workcenter.positions.length > 0) {
      this.workcenter.positions.forEach(pos => {
        if (pos.employees && pos.employees.length > 0) {
          pos.employees.forEach(emp => {
            count++;
            emp.even = (count % 2 === 0);
          });
        }
      });
    }
    if (this.workcenter.shifts && this.workcenter.shifts.length > 0) {
      this.workcenter.shifts.forEach(shft => {
        if (shft.employees && shft.employees.length > 0) {
          shft.employees.forEach(emp => {
            count++;
            emp.even = (count % 2 === 0);
          });
        }
      });
    }
  }

  nameWidth(): number {
    let width = (this.appState.viewWidth > 1089) ? 1089 
      : this.appState.viewWidth - 44; 
    const ratio = width / 1089;
    width = Math.floor(250 * ratio)
    if (width < 150) {
      width = 150;
    }
    this.width = Math.floor(25 * ratio);
    if (this.width < 15) {
      this.width = 15;
    }
    return width;
  }

  nameStyle(): string {
    return `width: ${this.nameWidth()}px;`
  }

  nameCellStyle(emp?: Employee): string {
    let width = (this.appState.viewWidth > 1089) ? 1089 
      : this.appState.viewWidth - 44; 
    const ratio = width / 1089;
    let fontSize = Math.floor(12 * ratio);
    if (fontSize < 9) fontSize = 9;
    if (!emp) {
      return `background-color: black;color: white;font-size: ${fontSize}pt;`
        + `width: ${this.nameWidth()}px;height: ${this.width}px;`;
    } else if (emp.even) {
      return `background-color: #c0c0c0;color: black;font-size: ${fontSize}pt;`
        + `width: ${this.nameWidth()}px;height: ${this.width}px;`;
    } else {
      return `background-color: white;color: black;font-size: ${fontSize}pt;`
        + `width: ${this.nameWidth()}px;height: ${this.width}px;`;
    }
  }

  daysStyle(): string {
    let width = (this.appState.viewWidth > 1089) ? 1089 
      : this.appState.viewWidth; 
    width -= (this.nameWidth() + 2);
    return `width: ${width}px;`;
  }
}
