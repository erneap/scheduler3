import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Site } from 'src/app/models/sites/site';
import { MonthPeriod, WeekPeriod } from '../site-mod-report-view.model';
import { Employee } from 'src/app/models/employees/employee';
import { AuthService } from 'src/app/services/auth.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { Team } from 'src/app/models/teams/team';

@Component({
  selector: 'app-site-mod-report-view-chart',
  templateUrl: './site-mod-report-view-chart.component.html',
  styleUrl: './site-mod-report-view-chart.component.scss'
})
export class SiteModReportViewChartComponent {
  private _width: number = 700;
  @Input()
  public set width(w: number) {
    this._width = w;
  }
  get width(): number {
    return this._width;
  }
  private _expandAll: boolean = false;
  @Output() changed = new EventEmitter<string>()
  site: Site;
  employees: Employee[] = [];
  start: Date = new Date();
  end: Date = new Date();
  months: MonthPeriod[] = [];
  expandAllText = '+';

  constructor(
    protected authService: AuthService,
    protected empService: EmployeeService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected dialogService: DialogService
  ) {
    this.site = new Site();
    const iSite = this.siteService.getSite();
    if (iSite) {
      this.site = new Site(iSite);
    }

    const now = new Date();
    const iTeam = this.teamService.getTeam();
    if (iTeam) {
      const team = new Team(iTeam);
      if (team.companies  && team.companies.length > 0) {
        team.companies.forEach(co => {
          if (co.modperiods && co.modperiods.length > 0) {
            co.modperiods.forEach(mod => {
              if (mod.start.getTime() <= now.getTime() 
                && mod.end.getTime() >= now.getTime()) {
                this.start = new Date(mod.start);
                this.end = new Date(mod.end);
              }
            });
          }
        });
      }
    }
    while (this.start.getUTCDay() !== 6) {
      this.start = new Date(this.start.getTime() - (24 * 3600000));
    }
    let start = new Date(this.start);
    while (start.getUTCDay() != 5) {
      start = new Date(start.getTime() + (24 * 3600000));
    }
    this.months = [];
    var period: MonthPeriod = new MonthPeriod();
    while (start.getTime() <= this.end.getTime() 
      && start.getTime() <= now.getTime()) {
      if (!period || period.month.getTime() < this.start.getTime() 
        || period.month.getUTCMonth() !== start.getUTCMonth()) {
        period = new MonthPeriod();
        period.month = new Date(start);
        period.expand = (start.getUTCMonth() === now.getUTCMonth() 
          && start.getUTCFullYear() === now.getUTCFullYear());
        this.months.push(period);
      }
      const week = new WeekPeriod();
      week.start = new Date(start.getTime() - (6 * 24 * 3600000));
      week.end = new Date(start);
      period.weeks.push(week);
      period.weeks.sort((a,b) => b.compareTo(a));
      start = new Date(start.getTime() + (7 * 24 * 3600000));
    }
    this.months.sort((a,b) => b.compareTo(a));
    this.getEmployees();
  }

  getEmployees(): void {
    this.employees = [];
    if (this.start.getTime() > 0) {
      if (this.site.employees) {
        this.site.employees.forEach(emp => {
          if (emp.showModTime(this.start, this.end)) {
            this.employees.push(new Employee(emp));
          }
        });
      }
    }
  }

  getDataClass(part: string, i: number): string {
    let answer = 'name ';
    answer += ((i % 2) === 0) ? 'even' : 'odd';
    answer += (part.toLowerCase() === 'name') ? 'total' : 'bal';
    return answer;
  }

  getUTCMonth(date: Date): string {
    date = new Date(date);
    let answer = `${date.getUTCMonth() + 1}/`;
    const year = `${date.getUTCFullYear()}`;
    answer += year.substring(2);
    return answer;
  }

  expand(month: number) {
    const periods: MonthPeriod[] = []
    this.months.forEach(m => {
      if (m.month.getTime() === month) {
        m.expand = !m.expand;
      }
      periods.push(new MonthPeriod(m));
    });
    periods.sort((a,b) => b.compareTo(a));
    this.months = periods;
  }

  setExpandAll() {
    const tMonths: MonthPeriod[] = []
    console.log(this.expandAllText);
    if (this.expandAllText.toLowerCase() === '+') {
      this.months.forEach(month => {
        month.expand = true;
        tMonths.push(new MonthPeriod(month));
      });
      this.expandAllText = '-';
    } else {
      const now = new Date();
      this.months.forEach(month => {
        if (now.getUTCFullYear() === month.month.getUTCFullYear() 
          && now.getUTCMonth() === month.month.getUTCMonth()) {
          month.expand = true;
        } else {
          month.expand = false;
        }
        tMonths.push(new MonthPeriod(month));
      });
      this.expandAllText = '+';
    }
    tMonths.sort((a,b) => b.compareTo(a));
    this.months = tMonths;
  }

  getValue(emp: Employee, start: Date, end: Date): number {
    return emp.getModTimeForPeriod(start, end);
  }

  getTotalValue(emp: Employee): string {
    if (this.months.length > 0) {
      let total = this.getValue(emp, 
        this.months[this.months.length - 1].startDate(), 
        this.months[0].endDate());
      return total.toFixed(1);
    }
    return '0.0';
  }

  dataStyle(field: string): string {
    if (field.toLowerCase() === 'name') {
      return 'width: 200px;';
    }
    return 'width: 50px;';
  }

  viewStyle(): string {
    const width = this.width - 14;
    return `width: ${width}px;`;
  }

  onChange(chg: string) {
    const parts = chg.toLowerCase().split("|")
    const bExpand = (parts[1] === 'true');
    let totals = 0;
    this.months.forEach(month => {
      if (month.month.getTime() === Number(parts[0])) {
        month.expand = bExpand;
      }
      if (month.expand) {
        totals++;
      }
    });
    if (totals < this.months.length) {
      this.expandAllText = '+';
    } else {
      this.expandAllText = '-';
    }
  }
}
