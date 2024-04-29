import { HttpClient } from '@angular/common/http';
import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Employee, IEmployee } from 'src/app/models/employees/employee';
import { Work } from 'src/app/models/employees/work';
import { Site } from 'src/app/models/sites/site';
import { Workcenter } from 'src/app/models/sites/workcenter';
import { SiteWorkResponse } from 'src/app/models/web/siteWeb';
import { ReportRequest } from 'src/app/models/web/teamWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-site-schedule-month2',
  templateUrl: './site-schedule-month2.component.html',
  styleUrls: ['./site-schedule-month2.component.scss'],
})
export class SiteScheduleMonth2Component {
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
  expanded: string[] = [];
  lastWorked: Date = new Date(0);
  monthForm: FormGroup;
  wkCount: number = 0;

  constructor(
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected dialogService: DialogService,
    protected authService: AuthService,
    private httpClient: HttpClient,
    private fb: FormBuilder
  ) {
    this.month = new Date();
    this.month = new Date(this.month.getFullYear(), this.month.getMonth(), 1);
    this.monthForm = this.fb.group({
      month: this.month.getMonth(),
      year: this.month.getFullYear(),
    })
    this.expanded = this.siteService.getExpanded();
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
    let width = ((27 * this.daysInMonth) + 204) - 2;
    let monthWidth = width - 458;
    this.wkctrStyle = `width: ${width}px;`;
    this.monthStyle = `width: ${monthWidth}px;`;
    const site = this.siteService.getSite();
    if (site) {
      if (!site.hasEmployeeWork(this.startDate.getFullYear())) {
        const team = this.teamService.getTeam();
        let teamid = '';
        if (team) { teamid = team.id; }
        this.dialogService.showSpinner();
        this.siteService.retrieveSiteWork(teamid, site.id, start.getFullYear())
        .subscribe({
          next: resp => {
            this.dialogService.closeSpinner();
            if (resp && resp.employees) {
              resp.employees.forEach(remp => {
                if (site.employees) {
                  site.employees.forEach(emp => {
                    if (remp.work) {
                      remp.work.forEach(wk => {
                        if (emp.work) {
                          const oWk = new Work(wk);
                          if (oWk.dateWorked.getTime() > this.lastWorked.getTime()) {
                            this.lastWorked = new Date(oWk.dateWorked);
                          }
                          emp.work.push(oWk);
                        }
                      })
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
          }
        });
      } else {
        if (site.employees) {
          site.employees.forEach(emp => {
            if (emp.work) {
              emp.work.forEach(wk => {
                if (wk.dateWorked.getTime() > this.lastWorked.getTime()) {
                  this.lastWorked = new Date(wk.dateWorked);
                }
              })
            }
          });
        }
        this.setWorkcenters(site);
      }
    }
  }

  setWorkcenters(site: Site) {
    this.dialogService.showSpinner();
    this.workcenters = [];
    const wkctrMap = new Map<string, number>();
    let addAll = this.expanded.length === 0;
    if (site && site.workcenters && site.workcenters.length > 0) {
      site.workcenters.forEach(wc => {
        this.workcenters.push(new Workcenter(wc));
        if (addAll) {
          this.openPanel(wc.id);
        }
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

  openPanel(id: string) {
    let found = false;
    this.expanded.forEach(wk => {
      if (wk.toLowerCase() === id.toLowerCase()) {
        found = true;
      }
    });
    if (!found) {
      this.expanded.push(id);
    }
    this.siteService.setExpanded(this.expanded);
  }

  closePanel(id: string) {
    let pos = -1;
    for (let i=0; i < this.expanded.length; i++) {
      if (this.expanded[i].toLowerCase() === id.toLowerCase()) {
        pos = i;
      }
    }
    if (pos >= 0) {
      this.expanded.splice(pos, 1);
    }
    this.siteService.setExpanded(this.expanded);
  }

  isExpanded(id: string): boolean {
    let answer = false;
    this.expanded.forEach(wc => {
      if (wc.toLowerCase() === id.toLowerCase()) {
        answer = true;
      }
    });
    return answer;
  }

  showShift(shiftID: string): boolean {
    const site = this.siteService.getSite();
    console.log(site);
    if (site) {
      console.log(`ShiftID: ${shiftID} - Show Mids: ${site.showMids}`);
      return ((shiftID.toLowerCase() === 'mids' && site.showMids) 
        || shiftID.toLowerCase() !== 'mids');
    }
    return true;
  }

  getDateStyle(dt: Date): string {
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

  onSubmit() {
    const url = '/api/v2/scheduler/reports';
    const iTeam = this.teamService.getTeam();
    const iSite = this.siteService.getSite();
    if (iTeam && iSite) {
      const request: ReportRequest = {
        reportType: 'siteschedule',
        period: '',
        teamid: iTeam.id,
        siteid: iSite.id
      };
      this.dialogService.showSpinner();
      this.httpClient.post(url, request, { responseType: "blob", observe: 'response'})
        .subscribe(file => {
          if (file.body) {
            const blob = new Blob([file.body],
              {type: 'application/vnd.openxmlformat-officedocument.spreadsheetml.sheet'});
              let contentDisposition = file.headers.get('Content-Disposition');
              let parts = contentDisposition?.split(' ');
              let fileName = '';
              parts?.forEach(pt => {
                if (pt.startsWith('filename')) {
                  let fParts = pt.split('=');
                  if (fParts.length > 1) {
                    fileName = fParts[1];
                  }
                }
              });
              if (!fileName) {
                fileName = 'SiteSchedule.xlsx';
              }
              const url = window.URL.createObjectURL(blob);
              
              const a: HTMLAnchorElement = document.createElement('a') as HTMLAnchorElement;
              a.href = url;
              a.download = fileName;
              document.body.appendChild(a);
              a.click();
    
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              this.dialogService.closeSpinner();
          }
        })
    }
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
