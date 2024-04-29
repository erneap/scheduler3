import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Employee, IEmployee } from 'src/app/models/employees/employee';
import { Work } from 'src/app/models/employees/work';
import { Site } from 'src/app/models/sites/site';
import { Workcenter } from 'src/app/models/sites/workcenter';
import { SiteWorkResponse } from 'src/app/models/web/siteWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-site-schedule-month',
  templateUrl: './site-schedule-month.component.html',
  styleUrls: ['./site-schedule-month.component.scss']
})
export class SiteScheduleMonthComponent {
  months: string[] = new Array("January", "February", "March", "April", "May",
    "June", "July", "August", "September", "October", "November", "December");

  weekdays: string[] = new Array("Su", "Mo", "Tu", "We", "Th", "Fr", "Sa");

  month: Date;
  monthLabel: string = '';
  daysInMonth: number = 30;
  wkctrStyle: string = "width: 1700px;";
  monthStyle: string = "width: 1300px;";
  workcenters: Workcenter[] = [];
  startDate: Date = new Date();
  endDate: Date = new Date();
  dates: Date[] = [];
  lastWorked: Date = new Date(0);
  monthForm: FormGroup;

  constructor(
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected dialogService: DialogService,
    protected authService: AuthService,
    private fb: FormBuilder
  ) {
    this.month = new Date();
    this.month = new Date(this.month.getFullYear(), this.month.getMonth(), 1);
    this.monthForm = this.fb.group({
      month: this.month.getMonth(),
      year: this.month.getFullYear(),
    })
    this.setMonth();
  }

  setMonth() {

    this.monthLabel = `${this.months[this.month.getMonth()]} `
      + `${this.month.getFullYear()}`;
    
    // calculate the display's start and end date, where start date is always
    // the sunday before the 1st of the month and end date is the saturday after
    // the end of the month.
    this.startDate = new Date(Date.UTC(this.month.getFullYear(), 
      this.month.getMonth(), 1, 0, 0, 0));
    this.endDate = new Date(Date.UTC(this.month.getFullYear(), 
      this.month.getMonth() + 1, 1, 0, 0, 0));
    
    let start = new Date(this.startDate);

    this.dates = [];
    while (start.getTime() < this.endDate.getTime()) {
      this.dates.push(new Date(start));
      start = new Date(start.getTime() + (24 * 3600000));
    }

    this.daysInMonth = this.dates.length;
    let width = ((27 * this.daysInMonth) + 202) - 2;
    let monthWidth = width - 408;
    this.wkctrStyle = `width: ${width}px;`;
    this.monthStyle = `width: ${monthWidth}px;`;
    const site = this.siteService.getSite();
    if (site) {
      if (!site.hasEmployeeWork(start.getFullYear())) {
        const team = this.teamService.getTeam();
        let teamid = '';
        if (team) { teamid = team.id; }
        const work = this.siteService.getSiteWork(teamid, site.id, 
          this.startDate.getFullYear());
        if (work && work.employees) {
          work.employees.forEach(remp => {
            if (site.employees) {
              site.employees.forEach(emp => {
                if (emp.id === remp.id) {
                  if (remp.work) {
                    remp.work.forEach(wk => {
                      emp.addWork(wk);
                      const oWk = new Work(wk);
                      if (oWk.dateWorked.getTime() > this.lastWorked.getTime()) {
                        this.lastWorked = new Date(oWk.dateWorked);
                      }
                    })
                  }
                }
              });
            }
          });
          this.setWorkcenters(site);
        } else {
          this.dialogService.showSpinner();
          this.siteService.retrieveSiteWork(teamid, site.id, 
            this.startDate.getFullYear()).subscribe({
            next: resp => {
              this.dialogService.closeSpinner();
              if (resp && resp.employees) {
                this.siteService.setSiteWork(teamid, site.id, resp);
                resp.employees.forEach(remp => {
                  if (site.employees) {
                    site.employees.forEach(emp => {
                      if (emp.id === remp.id) {
                        if (remp.work) {
                          remp.work.forEach(wk => {
                            emp.addWork(wk);
                          })
                        }
                      }
                    });
                  }
                });
                this.siteService.setSite(site);
              }
              this.setWorkcenters(site);
            },
            error: (err: SiteWorkResponse) => {
              this.dialogService.closeSpinner();
              this.authService.statusMessage = err.exception;
              this.setWorkcenters(site);
            }
          });
        }
      } else {
        this.setWorkcenters(site);
      }
    }
  }
  
  setWorkcenters(site: Site) {
    this.dialogService.showSpinner();
    this.workcenters = [];
    const wkctrMap = new Map<string, number>();
    if (site && site.workcenters && site.workcenters.length > 0) {
      site.workcenters.forEach(wc => {
        this.workcenters.push(new Workcenter(wc));
      });
      if (site.employees && site.employees.length > 0) {
        site.employees.forEach(emp => {
          // figure workcenter to include this employee, based on workcenter
          // individual works the most
          wkctrMap.clear();
          let start = new Date(Date.UTC(this.month.getUTCFullYear(), 
            this.month.getUTCMonth(), 1));
          this.dates.forEach(dt => {
            const wd = emp.getWorkdayWOLeaves(site.id, dt);
            if (wd.workcenter !== '') {
              let cnt = wkctrMap.get(wd.workcenter);
              if (cnt) {
                cnt++;
                wkctrMap.set(wd.workcenter, cnt);
              } else {
                cnt = 1;
                wkctrMap.set(wd.workcenter, cnt);
              }
            }
          }); 
          let wkctr = '';
          let count = 0;
          for (let key of wkctrMap.keys()) {
            let cnt = wkctrMap.get(key);
            if (cnt) {
              if (cnt > count) {
                count = cnt;
                wkctr = key;
              }
            }
          }
          if (count === 0) {
  
          }
          this.workcenters.forEach(wk => {
            if (wk.id.toLowerCase() === wkctr.toLowerCase()) {
              wk.addEmployee(emp, this.month);
              wk.setWorkcenterStyles();
            }
          });
        });
      }
    }
    this.dialogService.closeSpinner();
  }

  showShift(shiftID: string): boolean {
    const site = this.siteService.getSite();
    if (site) {
      return ((shiftID.toLowerCase() === 'mids' && site.showMids) 
        || shiftID.toLowerCase() !== 'mids');
    }
    return true;
  }

  getDateSyyle(dt: Date): string {
    if (dt.getUTCDay() === 0 || dt.getUTCDay() === 6) {
      return 'background-color: cyan;color: black;';
    }
    return 'background-color: white;color: black;';
  }

  changeMonth(direction: string, period: string) {
    if (direction.toLowerCase() === 'up') {
      if (period.toLowerCase() === 'month') {
        this.month = new Date(this.month.getFullYear(), 
          this.month.getMonth() + 1, 1);
      } else if (period.toLowerCase() === 'year') {
        this.month = new Date(this.month.getFullYear() + 1, 
        this.month.getMonth(), 1);
      }
    } else {
      if (period.toLowerCase() === 'month') {
        this.month = new Date(this.month.getFullYear(), 
          this.month.getMonth() - 1, 1);
      } else if (period.toLowerCase() === 'year') {
        this.month = new Date(this.month.getFullYear() - 1, 
        this.month.getMonth(), 1);
      }
    }
    this.monthForm.controls["month"].setValue(this.month.getMonth());
    this.monthForm.controls["year"].setValue(this.month.getFullYear());
    this.setMonth();
  }

  getLastWorked(iEmp: IEmployee): Date {
    const emp = new Employee(iEmp);
    let lastWorked: Date = new Date(0);
    const iSite = this.siteService.getSite();
    if (iSite) {
      const site = new Site(iSite);
      if (site.employees) {
        site.employees.forEach(e => {
          if (e.companyinfo.company === emp.companyinfo.company) {
            if (e.work) {
              e.work.forEach(wk => {
                if (wk.dateWorked.getTime() > lastWorked.getTime()) {
                  lastWorked = new Date(wk.dateWorked);
                }
              });
            }
          }
        });
      }
    }
    return lastWorked;
  }

  selectMonth() {
    let iMonth = Number(this.monthForm.value.month);
    let iYear = Number(this.monthForm.value.year);
    this.month = new Date(iYear, iMonth, 1);
    this.setMonth();
  }
}
