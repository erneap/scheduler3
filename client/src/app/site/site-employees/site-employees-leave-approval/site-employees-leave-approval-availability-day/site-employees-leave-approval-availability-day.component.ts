import { Component, Input } from '@angular/core';
import { ISite, Site } from 'src/app/models/sites/site';

@Component({
    selector: 'app-site-employees-leave-approval-availability-day',
    templateUrl: './site-employees-leave-approval-availability-day.component.html',
    styleUrls: ['./site-employees-leave-approval-availability-day.component.scss'],
    standalone: false
})
export class SiteEmployeesLeaveApprovalAvailabilityDayComponent {
  private _site: Site = new Site();
  @Input()
  public set site(s: ISite) {
    this._site = new Site(s);
  }
  get site(): Site {
    return this._site;
  }
  @Input() workcenterid: string = '';
  @Input() employeeid: string = '';
  @Input() requestid: string = '';
  private _date: Date = new Date(0);
  @Input()
  public set date(dt: Date) {
    this._date = new Date(dt);
  }
  get date(): Date {
    return this._date;
  }
  @Input() shiftids: string[] = [];
  @Input() width: number = 25;
}
