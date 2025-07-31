import { Component, Input } from '@angular/core';
import { ISite, Site } from 'src/app/models/sites/site';

@Component({
    selector: 'app-site-employees-leave-approval-availability',
    templateUrl: './site-employees-leave-approval-availability.component.html',
    styleUrls: ['./site-employees-leave-approval-availability.component.scss'],
    standalone: false
})
export class SiteEmployeesLeaveApprovalAvailabilityComponent {
  private _site: Site = new Site();
  @Input()
  public set site(s: ISite) {
    this._site = new Site(s);
    this.setShifts();
  }
  get site(): Site {
    return this._site;
  }
  private _wkctrid: string = '';
  @Input() 
  public set workcenterid(wid: string) {
    this._wkctrid = wid;
    this.setShifts();
  }
  get workcenterid(): string {
    return this._wkctrid;
  }
  private _empID: string = '';
  @Input() 
  public set employeeid(eid: string) {
    this._empID = eid;
    this.setDates();
  }
  get employeeid(): string {
    return this._empID;
  }
  private _reqID: string = '';
  @Input()
  public set requestid(rid: string) {
    this._reqID = rid;
    this.setDates();
  }
  get requestid(): string {
    return this._reqID;
  }
  @Input() width: number = 1000;
  shiftids: string[] = [];
  shiftLabels: string[] = [];
  dates: Date[] = [];

  setShifts() {
    this.shiftids = [];
    this.shiftLabels = [];
    if (this.site.id !== '' && this.workcenterid !== '') {
      this.site.workcenters.forEach(wk => {
        if (wk.id.toLowerCase() === this.workcenterid.toLowerCase()) {
          if (wk.shifts && wk.shifts.length > 0) {
            wk.shifts.forEach(shft => {
              this.shiftids.push(shft.id);
              this.shiftLabels.push(shft.name);
            });
          }
        }
      });
    }
  }

  setDates() {
    this.dates = [];
    if (this.employeeid !== '' && this.requestid !== '') {
      if (this.site && this.site.employees) {
        this.site.employees.forEach(emp => {
          if (emp.id === this.employeeid) {
            emp.requests.forEach(req => {
              if (req.id === this.requestid) {
                let start = new Date(req.startdate);
                while (start.getTime() <= req.enddate.getTime()) {
                  this.dates.push(new Date(start));
                  start = new Date(start.getTime() + (24 * 3600000));
                }
              }
            })
          }
        });
      }
    }
  }

  getShiftStyle(i: number): string {
    if (i % 2 === 0) {
      return "label even";
    }
    return "label odd";
  }
}
