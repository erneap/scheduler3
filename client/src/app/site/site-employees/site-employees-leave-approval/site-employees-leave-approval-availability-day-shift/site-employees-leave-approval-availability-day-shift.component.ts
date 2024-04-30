import { Component, Input } from '@angular/core';
import { LeaveRequest } from 'src/app/models/employees/leave';
import { ISite, Site } from 'src/app/models/sites/site';
import { Shift } from 'src/app/models/sites/workcenter';

@Component({
  selector: 'app-site-employees-leave-approval-availability-day-shift',
  templateUrl: './site-employees-leave-approval-availability-day-shift.component.html',
  styleUrls: ['./site-employees-leave-approval-availability-day-shift.component.scss']
})
export class SiteEmployeesLeaveApprovalAvailabilityDayShiftComponent {
  private _site: Site = new Site();
  @Input()
  public set site(s: ISite) {
    this._site = new Site(s);
    this.setValues();
  }
  get site(): Site {
    return this._site;
  }
  private _wkctrid: string = '';
  @Input() 
  public set workcenterid(wid: string) {
    this._wkctrid = wid;
    this.setValues();
  }
  get workcenterid(): string {
    return this._wkctrid;
  }
  private _empid: string = '';
  @Input()
  public set employeeid(eid: string) {
    this._empid = eid;
    this.setValues();
  }
  get employeeid(): string {
    return this._empid;
  }
  private _reqid: string = '';
  @Input() 
  public set requestid(rid: string) {
    this._reqid = rid;
    this.setValues();
  }
  get requestid(): string {
    return this._reqid;
  }
  private _shftid: string = '';
  @Input() 
  public set shiftid(sid: string) {
    this._shftid = sid;
    this.setValues();
  }
  get shiftid(): string {
    return this._shftid;
  }
  private _date: Date = new Date(0);
  @Input()
  public set date(dt: Date) {
    this._date = new Date(dt);
    this.setValues();
  }
  get date(): Date {
    return this._date;
  }
  @Input() width: number = 25;
  private _viewtype: string = 'day';
  @Input() 
  public set viewtype(vtype: string) {
    this._viewtype = vtype;
    this.setValues();
  }
  get viewtype(): string {
    return this._viewtype;
  }
  coverage: number = 0;
  minimums: number = 0;
  
  setValues() {
    this.coverage = 0;
    this.minimums = 0;
    if (this.viewtype.toLowerCase() === 'day') {
      this.coverage = this.date.getDate();
      return;
    }
    else if (this.site.id !== '' && this.workcenterid !== '' 
      && this.employeeid !== '' && this.requestid !== ''
      && this.shiftid !== '' && this.date.getTime() > 0) {
      let shift = new Shift();
      this.site.workcenters.forEach(wk => {
        if (wk.id.toLowerCase() === this.workcenterid.toLowerCase()) {
          if (wk.shifts && wk.shifts.length > 0) {
            wk.shifts.forEach(shft => {
              if (shft.id.toLowerCase() === this.shiftid.toLowerCase()) {
                shift = new Shift(shft);
              }
            });
          }
        }
      });
      this.minimums = shift.minimums;

      if (this.site.employees && this.site.employees.length > 0) {
        this.site.employees.forEach(emp => {
          let lastWork: Date = new Date(0);
          if (emp.work && emp.work.length > 0) {
            emp.work.sort((a,b) => a.compareTo(b));
          }
          if (emp.id === this.employeeid) {
            let omit: boolean = false;
            emp.requests.forEach(req => {
              if (req.id === this.requestid) {
                const lvDay = req.getLeaveDate(this.date);
                if (lvDay.code !== '') {
                  omit = true;
                }
              }
            });
            const wd = emp.getWorkday(emp.site, this.date, lastWork);
            if (!omit) {
              if (wd.workcenter.toLowerCase() === this.workcenterid.toLowerCase()) {
                if (shift.associatedCodes) {
                  shift.associatedCodes.forEach(ac => {
                    if (ac.toLowerCase() === wd.code.toLowerCase()) {
                      this.coverage++;
                    }
                  });
                }
              }
            }
          } else {
            const wd = emp.getWorkday(emp.site, this.date, lastWork);
            if (wd.workcenter.toLowerCase() === this.workcenterid.toLowerCase()) {
              if (shift.associatedCodes) {
                shift.associatedCodes.forEach(ac => {
                  if (ac.toLowerCase() === wd.code.toLowerCase()) {
                    this.coverage++;
                  }
                });
              }
            }
          }
        });
      }
    }
  }

  getStyles(): string {
    const ratio = this.width / 25;
    if (this.width > 25) {
      this.width = 25;
    }
    let fontSize = Math.floor(12 * ratio);
    if (fontSize < 9) {
      fontSize = 9;
    }
    let bkColor = "ffffff";
    let txColor = '000000';
    if (this.viewtype.toLowerCase() === 'day') {
      if (this.date.getDay() === 0 || this.date.getDay() === 6) {
        bkColor = '0000ff';
        txColor = 'ffffff';
      } else {
        bkColor = '000000';
        txColor = 'ffffff';
      }
    } else {
      if (this.coverage < this.minimums) {
        bkColor = 'ff8080';
        txColor = '000000';
      } else {
        if (this.date.getDay() === 0 || this.date.getDay() === 6) {
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
    }
    return `width: ${this.width}px;height: ${this.width};font-size: `
      + `${fontSize}pt;background-color: #${bkColor};color: #${txColor};`;
  }
}
