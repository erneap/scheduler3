import { Component, Input } from '@angular/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { ListItem } from 'src/app/generic/button-list/listitem';
import { Employee } from 'src/app/models/employees/employee';
import { LeaveRequest } from 'src/app/models/employees/leave';
import { ISite, Site } from 'src/app/models/sites/site';
import { Team } from 'src/app/models/teams/team';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-site-employee-leave-request-approver',
  templateUrl: './site-employee-leave-request-approver.component.html',
  styleUrls: ['./site-employee-leave-request-approver.component.scss'],
  providers: [
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true}},
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
  ]
})
export class SiteEmployeeLeaveRequestApproverComponent {
  private _site: Site;
  @Input()
  public set site(iSite: ISite) {
    this._site = new Site(iSite);
    this.setRequests();
  }
  get site(): Site {
    return this._site;
  }
  requests: ListItem[] = [];
  selected: string = '';
  requestEmployee: Employee = new Employee();
  request: LeaveRequest = new LeaveRequest();
  workcenter: string = '';

  constructor(
    protected authService: AuthService,
    protected dialogService: DialogService,
    protected empService: EmployeeService,
    protected siteService: SiteService,
    protected teamService: TeamService
  ) {
    const iSite = this.siteService.getSite();
    if (iSite) {
      this._site = new Site(iSite);
    } else {
      this._site = new Site();
    }
    this.setRequests();
  }

  getDateString(dt: Date): string {
    return `${dt.getMonth() + 1}/${dt.getDate()}/${dt.getFullYear()}`;
  }

  setRequests() {
    this.requests = [];
    let now = new Date();
    now = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const iUser = this.authService.getUser();
    if (iUser && this.site.employees) {
      this.site.employees.forEach(emp => {
        if (emp.id !== iUser.id) {
          if (emp.requests && emp.requests.length > 0) {
            let reqs = emp.requests.sort((a,b) => b.compareTo(a));
            reqs.forEach(req => {
              if (req.approvedby === '' 
              && req.status.toLowerCase() === 'requested') {
                let id = `${emp.id}|${req.id}`;
                let label = `${emp.name.last}: `
                  + `${this.getDateString(req.startdate)} - `
                  + `${this.getDateString(req.enddate)} (`
                  + `${req.primarycode.toUpperCase()})`;
                this.requests.push(new ListItem(id, label));
              }
            });
          }
        }
      });
    }
  }

  getButtonClass(id: string): string  {
    let answer = "employee";
    if (this.selected === id) {
      answer += ' active';
    }
    return answer;
  }

  onSelect(id: string) {
    this.selected = id;
    this.workcenter = '';
    const parts = id.split("|");
    if (this.site.employees) {
      this.site.employees.forEach(emp => {
        if (emp.id === parts[0]) {
          if (emp.requests) {
            emp.requests.forEach(req => {
              if (req.id === parts[1]) {
                this.requestEmployee = new Employee(emp);
                this.request = new LeaveRequest(req);
                let testDate = new Date(this.request.startdate);
                while (this.workcenter === '' 
                  && testDate.getTime() <= this.request.enddate.getTime()) {
                  const wd = this.requestEmployee.getWorkdayWOLeaves(
                    this.site.id, testDate);
                  this.workcenter = wd.workcenter;
                  testDate = new Date(testDate.getTime() + (24 * 3600000));
                }
              }
            });
          }
        }
      });
    }
  }

  employeeChanged(emp: Employee) {
    if (this.site.employees) {
      for (let i=0; i < this.site.employees.length; i++) {
        if (this.site.employees[i].id === emp.id) {
          this.site.employees[i] = emp;
          const iSite = this.siteService.getSite();
          if (iSite && iSite.id === this.site.id) {
            this.siteService.setSite(this.site);
          }
          this.teamService.setSelectedSite(new Site(this.site));
        }
      }
    }
    const iTeam = this.teamService.getTeam();
    if (iTeam) {
      const team = new Team(iTeam);
      if (team.sites) {
        for (let i=0; i < team.sites.length; i++) {
          if (team.sites[i].id === this.site.id) {
            team.sites[i] = this.site;
            this.teamService.setTeam(team);
          }
        }
      }
    }
    this.setRequests();
  }
 }
