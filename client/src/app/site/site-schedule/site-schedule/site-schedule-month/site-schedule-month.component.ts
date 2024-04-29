import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Site } from 'src/app/models/sites/site';
import { Workcenter } from 'src/app/models/sites/workcenter';
import { Team } from 'src/app/models/teams/team';
import { Workcode } from 'src/app/models/teams/workcode';
import { ReportRequest } from 'src/app/models/web/teamWeb';
import { AppStateService } from 'src/app/services/app-state.service';
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

  month: Date;
  monthLabel: string = '';
  daysInMonth: number = 30;
  wkctrStyle: string = "width: 1700px;";
  monthStyle: string = "width: 1300px;";
  moveStyle: string = 'width: 100px;';
  workcenters: Workcenter[] = [];
  startDate: Date = new Date();
  endDate: Date = new Date();
  dates: Date[] = [];
  expanded: string[] = [];
  lastWorked: Date = new Date(0);
  monthForm: FormGroup;
  wkCount: number = 0;
  site: Site = new Site();
  workCodes: Workcode[];

  constructor(
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected dialogService: DialogService,
    protected authService: AuthService,
    protected appState: AppStateService,
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
    const iSite = this.siteService.getSite();
    if (iSite) {
      this.site = new Site(iSite);
    }
    this.workCodes = [];
    const iTeam = this.teamService.getTeam();
    if (iTeam) {
      const team = new Team(iTeam);
      if (team.workcodes) {
        team.workcodes.forEach(wc => {
          this.workCodes.push(new Workcode(wc))
        });
      }
    }
    this.setWorkcenter();
    this.setStyles();
  }

  setStyles(): void {
    let end = new Date(this.month.getFullYear(), this.month.getMonth() + 1, 1);
    end = new Date(end.getTime() - (24 * 3600000));
    let maxWidth = (end.getDate() * 27) + 252 + 40;
    let width = (this.appState.viewWidth < maxWidth) 
      ? this.appState.viewWidth - 20 : maxWidth;
    const ratio = width / (maxWidth - 40);
    const moveWidth = Math.floor(100 * ratio);
    let moveFontSize = Math.floor(14 * ratio);
    if (moveFontSize < 10) { moveFontSize = 10;}
    const monthWidth = (width - (4 * (moveWidth + 2)));
    this.monthStyle = `width: ${monthWidth}px;font-size: ${moveFontSize}pt;`;
    this.moveStyle = `width: ${moveWidth}px;font-size: ${moveFontSize}pt;`;
    this.wkctrStyle = `width: ${width}px;`;
  }

  setWorkcenter() {
    this.workcenters = [];
    if (this.site && this.site.workcenters) {
      this.site.workcenters.forEach(wc => {
        this.workcenters.push(new Workcenter(wc));
      });
    }
    this.workcenters.sort((a,b) => a.compareTo(b));
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
    if (site) {
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
    this.setStyles();
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

  selectMonth() {
    let iMonth = Number(this.monthForm.value.month);
    let iYear = Number(this.monthForm.value.year);
    this.month = new Date(iYear, iMonth, 1);
    this.setStyles();
  }
}
