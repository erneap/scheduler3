import { Component } from '@angular/core';
import { Employee } from 'src/app/models/employees/employee';
import { Site } from 'src/app/models/sites/site';
import { Team } from 'src/app/models/teams/team';
import { EmployeeService } from 'src/app/services/employee.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

export class WeekPeriod {
  start: Date = new Date(0);
  end: Date = new Date(0);

  constructor(other?: WeekPeriod) {
    this.start = (other) ? new Date(other.start) : new Date(0);
    this.end = (other) ? new Date(other.end) : new Date(0);
  }

  compareTo(other?: WeekPeriod): number {
    if (other) {
      return (this.start.getTime() < other.start.getTime()) ? -1 : 1;
    }
    return 0;
  }
}

export class MonthPeriod {
  month: Date = new Date(0);
  weeks: WeekPeriod[] = [];
  expand: boolean = false;

  constructor(month?: MonthPeriod) {
    this.month = (month) ? new Date(month.month) : new Date(0);
    this.expand = (month) ? month.expand : false;
    this.weeks = [];
    if (month && month.weeks) {
      month.weeks.forEach(pd => {
        this.weeks.push(new WeekPeriod(pd));
      });
      this.weeks.sort((a,b) => b.compareTo(a))
    }
  }

  compareTo(other?: MonthPeriod): number {
    if (other) {
      return (this.month.getTime() < other.month.getTime()) ? -1 : 1;
    }
    return 0;
  }

  startDate(): Date {
    if (this.weeks.length > 0) {
      return new Date(this.weeks[this.weeks.length - 1].start);
    }
    return new Date(this.month);
  }

  endDate(): Date {
    if (this.weeks.length > 0) {
      return new Date(this.weeks[0].end)
    }
    return this.month;
  }
}

@Component({
  selector: 'app-site-mod-report-view',
  templateUrl: './site-mod-report-view.component.html',
  styleUrls: ['./site-mod-report-view.component.scss']
})
export class SiteModReportViewComponent {
  site: Site;
  employees: Employee[] = [];
  start: Date = new Date(0);
  end: Date = new Date(0);
  months: MonthPeriod[] = [];
  expandAllText: string = "Expand All";

  constructor(
    protected empService: EmployeeService,
    protected siteService: SiteService,
    protected teamService: TeamService
  ) {
    const iSite = this.siteService.getSite();
    this.site = new Site(iSite);
    const now = new Date();

    const iEmp = this.empService.getEmployee();
    const emp = new Employee(iEmp);
    let company = emp.companyinfo.company;

    const iTeam = this.teamService.getTeam();
    const team = new Team(iTeam);
    team.companies.forEach(co => {
      if (co.id.toLowerCase() === company.toLowerCase()) {
        co.modperiods.forEach(mdp => {
          if (mdp.start.getTime() <= now.getTime() 
            && mdp.end.getTime() >= now.getTime()) {
            this.start = new Date(mdp.start);
            this.end = new Date(mdp.end);
          }
        });
      }
    });
    while (this.start.getDay() !== 6) {
      this.start = new Date(this.start.getTime() - (24 * 3600000));
    }
    let start = new Date(this.start);
    while (start.getDay() != 5) {
      start = new Date(start.getTime() + (24 * 3600000));
    }
    this.months = [];
    var period: MonthPeriod = new MonthPeriod();
    while (start.getTime() <= this.end.getTime() 
      && start.getTime() <= now.getTime()) {
      if (!period || period.month.getTime() < this.start.getTime() 
        || period.month.getMonth() !== start.getMonth()) {
        period = new MonthPeriod();
        period.month = new Date(start);
        period.expand = (start.getMonth() === now.getMonth() 
          && start.getFullYear() === now.getFullYear());
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

  getMonth(date: Date): string {
    date = new Date(date);
    let answer = `${date.getMonth() + 1}/`;
    const year = `${date.getFullYear()}`;
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

  monthWidth(month: number): string {
    let width = 50;
    this.months.forEach(m => {
      if (m.month.getTime() === month && m.expand) {
        width = 50 + (m.weeks.length * 52);
      }
    });
    return `width: ${width}px;`
  }

  expandAll() {
    if (this.expandAllText === 'Expand All') {
      const periods: MonthPeriod[] = []
      this.months.forEach(m => {
        m.expand = true;
        periods.push(new MonthPeriod(m));
      });
      periods.sort((a,b) => b.compareTo(a));
      this.months = periods;
      this.expandAllText = 'Contract All';
    } else {
      const periods: MonthPeriod[] = []
      this.months.forEach(m => {
        m.expand = false;
        periods.push(new MonthPeriod(m));
      });
      periods.sort((a,b) => b.compareTo(a));
      this.months = periods;
      this.expandAllText = 'Expand All';
    }
  }
}
