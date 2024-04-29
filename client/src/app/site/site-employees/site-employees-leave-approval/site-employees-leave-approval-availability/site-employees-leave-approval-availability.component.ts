import { Component, Input } from '@angular/core';
import { ISite, Site } from 'src/app/models/sites/site';

@Component({
  selector: 'app-site-employees-leave-approval-availability',
  templateUrl: './site-employees-leave-approval-availability.component.html',
  styleUrls: ['./site-employees-leave-approval-availability.component.scss']
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
  @Input() employeeid: string = '';
  @Input() requestid: string = '';
  @Input() width: number = 1000;
  shiftids: string[] = [];
  shiftLabels: string[] = [];

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
}
