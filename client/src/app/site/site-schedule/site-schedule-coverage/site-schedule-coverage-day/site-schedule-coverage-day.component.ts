import { Component, Input } from '@angular/core';
import { Work } from 'src/app/models/employees/work';
import { ISite, Site } from 'src/app/models/sites/site';
import { Shift } from 'src/app/models/sites/workcenter';

@Component({
  selector: 'app-site-schedule-coverage-day',
  templateUrl: './site-schedule-coverage-day.component.html',
  styleUrls: ['./site-schedule-coverage-day.component.scss']
})
export class SiteScheduleCoverageDayComponent {
  private _site: Site = new Site();
  @Input()
  public set site(s: ISite) {
    this._site = new Site(s);
    this.setCoverage();
  }
  get site(): Site {
    return this._site;
  }
  private _date: Date = new Date(0);
  @Input()
  public set date(dt: Date) {
    this._date = new Date(dt);
    this.setCoverage();
  }
  get date(): Date {
    return this._date;
  }
  private _wkctrID: string = '';
  @Input() 
  public set wkctrID(w: string) {
    this._wkctrID = w;
    this.setCoverage();
  }
  get wkctrID(): string {
    return this._wkctrID;
  }
  private _shiftID: string = '';
  @Input()
  public set shiftID(s: string) {
    this._shiftID = s;
    this.setCoverage();
  }
  get shiftID(): string {
    return this._shiftID;
  }
  @Input() width: number = 25;
  @Input() viewtype: string = 'label';
  coverage: number = 0;
  minimums: number = 0;

  setCoverage(): void {
    // ensure all required fields are present before attempting calculation
    if (this.site.id !== '' && this.date.getTime() !== 0 && this.wkctrID !== ''
      && this.shiftID !== '') {
      // determine the shift requirements from the site 
      let count = 0;
      let shift: Shift = new Shift();
      this.site.workcenters.forEach(wc => {
        if (wc.id.toLowerCase() === this.wkctrID.toLowerCase()) {
          if (wc.shifts && wc.shifts.length > 0) {
            wc.shifts.forEach(shft => {
              if (shft.id.toLowerCase() === this.shiftID.toLowerCase()) {
                shift = new Shift(shft);
              }
            });
          }
        }
      });
      if (this.site.employees && this.site.employees.length > 0) {
        this.site.employees.forEach(emp => {
          let work = new Work();
          if (emp.work && emp.work.length > 0) {
            emp.work.sort((a,b) => a.compareTo(b));
            work = emp.work[emp.work.length - 1];
          }
          const wd = emp.getWorkday(this.site.id, this.date, work.dateWorked);
          if (wd.workcenter.toLowerCase() === this.wkctrID.toLowerCase()) {
            if (shift.associatedCodes && shift.associatedCodes.length > 0) {
              shift.associatedCodes.forEach(ac => {
                if (ac.toLowerCase() === wd.code.toLowerCase()) {
                  count++;
                }
              });
            }
          }
        });
      }
      this.coverage = count;
      this.minimums = shift.minimums;
    }
  }

  getDisplay(): string {
    const weekdays = new Array("Su", "Mo", "Tu", "We", "Th", "Fr", "Sa");
    if (this.viewtype === 'label' || this.viewtype === 'day' ) {
      if (this.viewtype === 'label') {
        return `${this.date.getUTCDate()}`;
      } 
      return weekdays[this.date.getUTCDay()];
    }
    return `${this.coverage}`;
  }

  getUTCDateStyle(): string {
    const ratio = this.width / 25;
    const fontSize = (this.width <= 15) ? 9 : Math.floor(12 * ratio);
    let bkColor: string = "ffffff";
    let txColor: string = "000000";

    if (this.coverage < this.minimums) {
      bkColor = "ff8080";
    }
    if (bkColor === 'ffffff') {
      if (this.date.getUTCDay() === 0 || this.date.getUTCDay() === 6) {
        if (this.viewtype === 'even') {
          bkColor = '3399ff';
        } else {
          bkColor = '99ccff';
        }
      } else {
        if (this.viewtype === 'even') {
          bkColor = 'c0c0c0';
        } else {
          bkColor = 'ffffff';
        }
      }
    }

    return `width: ${this.width}px;height: ${this.width}px;fontsize: `
      + `${fontSize}pt;background-color: #${bkColor};color: #${txColor};`;
  }
}
