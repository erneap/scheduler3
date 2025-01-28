import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Site } from 'src/app/models/sites/site';
import { Workcenter } from 'src/app/models/sites/workcenter';
import { AppStateService } from 'src/app/services/app-state.service';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-site-schedule-coverage-month',
  templateUrl: './site-schedule-coverage-month.component.html',
  styleUrls: ['./site-schedule-coverage-month.component.scss']
})
export class SiteScheduleCoverageMonthComponent {
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
  lastWorked: Date = new Date(0);
  monthForm: FormGroup;
  wkCount: number = 0;
  site: Site = new Site();

  constructor(
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected dialogService: DialogService,
    protected authService: AuthService,
    protected appState: AppStateService,
    private fb: FormBuilder
  ) {
    this.month = new Date();
    this.month = new Date(Date.UTC(this.month.getUTCFullYear(), 
      this.month.getUTCMonth(), 1));
    this.monthForm = this.fb.group({
      month: this.month.getUTCMonth(),
      year: this.month.getUTCFullYear(),
    });
    const iSite = this.siteService.getSite();
    if (iSite) {
      this.site = new Site(iSite);
    }
    this.setWorkcenter();
    this.setStyles();
  }

  setStyles(): void {
    let end = new Date(this.month.getUTCFullYear(), this.month.getUTCMonth() + 1, 1);
    end = new Date(end.getTime() - (24 * 3600000));
    let maxWidth = (end.getUTCDate() * 27) + 252 + 40;
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

  getUTCDateStyle(dt: Date): string {
    if (dt.getUTCDay() === 0 || dt.getUTCDay() === 6) {
      return 'background-color: cyan;color: black;';
    }
    return 'background-color: white;color: black;';
  }

  changeMonth(direction: string, period: string) {
    if (direction.toLowerCase() === 'up') {
      if (period.toLowerCase() === 'month') {
        this.month = new Date(Date.UTC(this.month.getUTCFullYear(), 
          this.month.getUTCMonth() + 1, 1));
      } else if (period.toLowerCase() === 'year') {
        this.month = new Date(Date.UTC(this.month.getUTCFullYear() + 1, 
        this.month.getUTCMonth(), 1));
      }
    } else {
      if (period.toLowerCase() === 'month') {
        this.month = new Date(Date.UTC(this.month.getUTCFullYear(), 
          this.month.getUTCMonth() - 1, 1));
      } else if (period.toLowerCase() === 'year') {
        this.month = new Date(Date.UTC(this.month.getUTCFullYear() - 1, 
        this.month.getUTCMonth(), 1));
      }
    }
    this.monthForm.controls["month"].setValue(this.month.getUTCMonth());
    this.monthForm.controls["year"].setValue(this.month.getUTCFullYear());
    this.setStyles();
  }

  selectMonth() {
    let iMonth = Number(this.monthForm.value.month);
    let iYear = Number(this.monthForm.value.year);
    this.month = new Date(iYear, iMonth, 1);
    this.setStyles();
  }
}
