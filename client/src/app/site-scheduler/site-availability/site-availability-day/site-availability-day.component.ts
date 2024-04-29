import { Component, Input } from '@angular/core';
import { Employee } from 'src/app/models/employees/employee';
import { Workcenter, IWorkcenter, IShift, Shift } from 'src/app/models/sites/workcenter';
import { SiteService } from 'src/app/services/site.service';

@Component({
  selector: 'app-site-availability-day',
  templateUrl: './site-availability-day.component.html',
  styleUrls: ['./site-availability-day.component.scss']
})
export class SiteAvailabilityDayComponent {
  private _workcenter: string = ''
  private _shift: Shift = new Shift();
  private _date: Date = new Date();
  @Input()
  public set workcenter(wkc: string) {
    this._workcenter = wkc;
    this.setDay();
  }
  get workcenter(): string {
    return this._workcenter;
  }
  @Input()
  public set shift(shft: IShift) {
    this._shift = new Shift(shft);
    this.setDay();
  }
  get shift(): Shift {
    return this._shift;
  }
  @Input()
  public set date(dt: Date) {
    this._date = new Date(dt);
    this.setDay();
  }
  get date(): Date {
    return this._date;
  }
  count = 0;
  dayStyle: string = 'background-color: white;';

  constructor(
    protected siteService: SiteService
  ) { }

  setDay() {
    this.count = 0;
    const site = this.siteService.getSite();
    if (site && site.employees && site.employees.length > 0) {
      site.employees.forEach(iEmp => {
        let lastWorked = new Date(0);
        const emp = new Employee(iEmp);
        const wd = emp.getWorkday(site.id, this.date, lastWorked);
        if (wd.workcenter.toLowerCase() === this.workcenter.toLowerCase()) {
          if (this.shift && this.shift.associatedCodes) {
            this.shift.associatedCodes.forEach(code => {
              if (wd.code.toLowerCase() === code.toLowerCase()) {
                this.count++;
              }
            });
          }
        }
      });
      if (this.shift) {
        if (this.shift.minimums && this.count < this.shift.minimums) {
          this.dayStyle = 'background-color: #FFB3B3;';
        } else {
          if (this.date.getUTCDay() === 0 || this.date.getUTCDay() === 6) {
            this.dayStyle = 'background-color: cyan;';
          } else {
            this.dayStyle = 'background-color: white;';
          }
        }
      }
    }
  }
}
