import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ListItem } from 'src/app/generic/button-list/listitem';
import { ForecastReport, IForecastReport, ForecastPeriod } 
  from 'src/app/models/sites/forecastreport';
import { ISite, Site } from 'src/app/models/sites/site';
import { SiteResponse } from 'src/app/models/web/siteWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-site-forecast-report-periods',
  templateUrl: './site-forecast-report-periods.component.html',
  styleUrls: ['./site-forecast-report-periods.component.scss']
})
export class SiteForecastReportPeriodsComponent {
  private _report: ForecastReport = new ForecastReport();
  private _site: Site = new Site();
  @Input()
  public set report(rpt: IForecastReport) {
    this._report = new ForecastReport(rpt);
    this.setPeriods();
  }
  get report(): ForecastReport {
    return this._report;
  }
  @Input()
  public set site(iSite: ISite) {
    this._site = new Site(iSite);
  }
  get site(): Site {
    return this._site;
  }
  @Output() siteChanged = new EventEmitter<Site>();
  teamid: string;
  periods: ListItem[] = [];
  periodMap = new Map<string, ForecastPeriod>()
  selected: string = 'new';

  constructor(
    protected authService: AuthService,
    protected dialogService: DialogService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    private fb: FormBuilder
  ) {
    const team = this.teamService.getTeam();
    if (team) {
      this.teamid = team.id
    } else {
      this.teamid = '';
    }
  }
  
  getButtonStyle(id: string): string {
    if (id.toLowerCase() === this.selected.toLowerCase()) {
      return "employee active";
    }
    return "employee";
  }

  getListHeight(): string {
    if (this.report.periods && this.report.periods.length > 0) {
      const length = (this.report.periods.length+1) * 30;
      return `height: ${length}px;`;
    }
    return `height: 30px;`;
  }

  setPeriods() {
    this.periods = [];
    if (this.report.periods) {
      this.report.periods.sort((a,b) => a.compareTo(b));
      this.report.periods.forEach(prd => {
        const id = `${prd.month.getMonth() + 1}/${prd.month.getFullYear()}`;
        this.periodMap.set(id, prd);
        let label = '';
        if (prd.periods) {
          prd.periods.forEach(prds => {
            if (label !== '') {
              label += ",";
            }
            label += `${prds.getMonth() + 1}/${prds.getDate()}`;
          });
        }
        label = `${id} - ${label}`;
        this.periods.push(new ListItem(id, label));
      });
    }
  }

  selectPeriod(id: string) {
    this.selected = id;
  }

  getDateString(date: Date): string {
    let answer = `${date.getFullYear()}-`;
    if (date.getMonth() < 9) {
      answer += '0';
    }
    answer += `${date.getMonth() + 1}-`;
    if (date.getDate() < 10) {
      answer += '0';
    }
    answer += `${date.getDate()}`;
    return answer;
  }

  onMovePeriod(direction: string) {
    const frmPrd = this.periodMap.get(this.selected);
    if (frmPrd) {
      const fromMonth = this.getDateString(frmPrd.month);
      let toMonth = this.getDateString(frmPrd.month);
      if (direction.toLowerCase().substring(0,1) === 'b') {
        const month = new Date(Date.UTC(frmPrd.month.getFullYear(), 
          frmPrd.month.getMonth() - 1, 1));
        toMonth = this.getDateString(month);
      } else {
        const month = new Date(Date.UTC(frmPrd.month.getFullYear(), 
          frmPrd.month.getMonth() + 1, 1));
        toMonth = this.getDateString(month);
      }
      this.authService.statusMessage = "Moving weeks between periods"
      this.dialogService.showSpinner();
      this.siteService.updateForecastReport(this.teamid, this.site.id, 
        this.report.id, 'move', `${fromMonth}|${toMonth}`).subscribe({
        next: (data: SiteResponse) => {
          this.dialogService.closeSpinner();
          if (data && data != null && data.site) {
            this.site = new Site(data.site);
            this.siteChanged.emit(new Site(data.site));
            if (this.site.forecasts) {
              this.site.forecasts.forEach(rpt => {
                if (rpt.id === this.report.id) {
                  this.report = rpt;
                }
              })
            }
            const site = this.siteService.getSite();
            if (site && data.site.id === site.id) {
              this.siteService.setSite(new Site(data.site));
            }
            this.teamService.setSelectedSite(new Site(data.site));
          }
          this.authService.statusMessage = "Retrieval complete"
        },
        error: (err: SiteResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      });
    }
  }
}
