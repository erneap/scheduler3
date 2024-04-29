import { Component, Input } from '@angular/core';
import { ILeaveRequest, LeaveRequest } from 'src/app/models/employees/leave';
import { ISite, Site } from 'src/app/models/sites/site';
import { SiteService } from 'src/app/services/site.service';

@Component({
  selector: 'app-site-employee-leave-request-availability-period',
  templateUrl: './site-employee-leave-request-availability-period.component.html',
  styleUrls: ['./site-employee-leave-request-availability-period.component.scss']
})
export class SiteEmployeeLeaveRequestAvailabilityPeriodComponent {
  private _site: Site;
  private _workcenter: string = '';
  private _request: LeaveRequest = new LeaveRequest();
  private _employeeID: string = '';
  @Input()
  public set site(iSite: ISite) {
    this._site = new Site(iSite);
    this.setWorkcenter();
  }
  get site(): Site {
    return this._site;
  }
  @Input()
  public set workcenter(wc: string) {
    this._workcenter = wc;
    this.setWorkcenter();
  }
  get workcenter(): string {
    return this._workcenter;
  }
  @Input() 
  public set request(lr: ILeaveRequest) {
    this._request = new LeaveRequest(lr);
    this.setWorkcenter();
  }
  get request(): LeaveRequest {
    return this._request;
  }
  @Input()
  public set employee(id: string) {
    this._employeeID = id;
  }
  get employee(): string {
    return this._employeeID;
  }
  dates: Date[] = [];
  shifts: string[] = [];
  workcenterTitle: string = '';

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

  setWorkcenter() {
    this.dates = [];
    this.shifts = [];
    let sDate = new Date(Date.UTC(this.request.startdate.getFullYear(),
      this.request.startdate.getMonth(), this.request.startdate.getDate()));
    while (sDate.getTime() <= this.request.enddate.getTime()) {
      this.dates.push(new Date(sDate));
      sDate = new Date(sDate.getTime() + (24 * 3600000));
    }
    if (this.site.workcenters) {
      this.site.workcenters.forEach(wc => {
        if (wc.id === this.workcenter) {
          this.workcenterTitle = wc.name;
          if (wc.shifts) {
            wc.shifts.forEach(s => {
              this.shifts.push(s.id);
            })
          }
        }
      });
    }
  }
}
