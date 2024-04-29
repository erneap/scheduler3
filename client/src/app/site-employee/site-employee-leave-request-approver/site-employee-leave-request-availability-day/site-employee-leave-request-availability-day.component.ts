import { Component, Input } from '@angular/core';
import { Employee } from 'src/app/models/employees/employee';
import { ILeaveRequest, LeaveRequest } from 'src/app/models/employees/leave';
import { ISite, Site } from 'src/app/models/sites/site';
import { Shift, Workcenter } from 'src/app/models/sites/workcenter';
import { AuthService } from 'src/app/services/auth.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-site-employee-leave-request-availability-day',
  templateUrl: './site-employee-leave-request-availability-day.component.html',
  styleUrls: ['./site-employee-leave-request-availability-day.component.scss']
})
export class SiteEmployeeLeaveRequestAvailabilityDayComponent {
  private _site: Site;
  private _workcenter: string = '';
  private _shift: string = '';
  private _date: Date = new Date();
  private _request: LeaveRequest = new LeaveRequest();
  private _employeeID: string = '';
  @Input()
  public set site(iSite: ISite) {
    this._site = new Site(iSite);
    this.getCoverage();
  }
  get site(): Site {
    return this._site;
  }
  @Input()
  public set workcenter(wc: string) {
    this._workcenter = wc;
    this.getCoverage();
  }
  get workcenter(): string {
    return this._workcenter;
  }
  @Input()
  public set shift(s: string) {
    this._shift = s;
    this.getCoverage();
  }
  get shift(): string {
    return this._shift;
  }
  @Input()
  public set date(dt: Date) {
    this._date = new Date(dt);
    this.getCoverage();
  }
  get date(): Date {
    return this._date;
  }
  @Input() 
  public set request(lr: ILeaveRequest) {
    this._request = new LeaveRequest(lr);
    this.getCoverage();
  }
  get request(): LeaveRequest {
    return this._request;
  }
  @Input()
  public set employee(id: string) {
    this._employeeID = id;
    this.getCoverage();
  }
  get employee(): string {
    return this._employeeID;
  }
  coverage: number = 0;
  lastWorked: Date = new Date(0);

  constructor(
    protected siteService: SiteService
  ) {
    const iSite = this.siteService.getSite();
    if (iSite) {
      this._site = new Site(iSite);
    } else {
      this._site = new Site();
    }
  }

  getCoverage(): void {
    let answer = 0;
    let shift: Shift | undefined = undefined;
    if (this.site.workcenters) {
      this.site.workcenters.forEach(wc => {
        if (wc.id === this.workcenter) {
          if (wc.shifts) {
            wc.shifts.forEach(s => {
              if (s.id === this.shift) {
                shift = new Shift(s);
              }
            });
          }
        }
      })
    }
    if (this.site.employees) {
      this.site.employees.forEach(emp => {
        if (emp.work) {
          emp.work.forEach(wk => {
            if (wk.dateWorked.getTime() > this.lastWorked.getTime()) {
              this.lastWorked = new Date(wk.dateWorked);
            }
          })
        }
      });
    }
    let bUse = false;
    this.request.requesteddays.forEach(day => {
      if (this.date.getFullYear() === day.leavedate.getFullYear()
        && this.date.getMonth() === day.leavedate.getMonth()
        && this.date.getDate() === day.leavedate.getDate() 
        && day.code !== '') {
          bUse = true;
        }
    });
    if (this.site.employees) {
      this.site.employees.forEach(iEmp => {
        const emp = new Employee(iEmp);
        const wd = emp.getWorkday(this.site.id, this.date, this.lastWorked);
        if (wd.workcenter.toLowerCase() === this.workcenter.toLowerCase()) {
          if (shift  && shift.associatedCodes) {
            shift.associatedCodes.forEach(ac => {
              if (ac.toLowerCase() === wd.code.toLowerCase()
                && !(emp.id === this.employee && bUse)) {
                answer++;
              }
            });
          }
        }
      });
    }
    this.coverage = answer;
  }

  getDayStyle(): string {
    let answer = "background-color: #ffffff;";
    if (this.site.workcenters) {
      this.site.workcenters.forEach(wc => {
        if (wc.id === this.workcenter) {
          if (wc.shifts) {
            wc.shifts.forEach(s => {
              if (s.id === this.shift) {
                if (this.coverage < s.minimums) {
                  answer = "background-color: #ff9999;";
                }
              }
            });
          }
        }
      })
    }
    return answer;
  }
}
