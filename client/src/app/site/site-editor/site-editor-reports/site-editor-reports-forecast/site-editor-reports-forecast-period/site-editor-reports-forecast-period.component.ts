import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ListItem } from 'src/app/generic/button-list/listitem';
import { ForecastPeriod, ForecastReport, IForecastReport } from 'src/app/models/sites/forecastreport';
import { ISite, Site } from 'src/app/models/sites/site';
import { SiteResponse } from 'src/app/models/web/siteWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-site-editor-reports-forecast-period',
  templateUrl: './site-editor-reports-forecast-period.component.html',
  styleUrls: ['./site-editor-reports-forecast-period.component.scss']
})
export class SiteEditorReportsForecastPeriodComponent {
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
  @Input() teamid: string = '';
  @Output() changed = new EventEmitter<Site>();
  periods: ListItem[] = [];
  periodMap = new Map<string, ForecastPeriod>()
  selected: string = 'new';
  periodForm: FormGroup;

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
    this.periodForm = this.fb.group({
      newdate: [new Date(), [Validators.required]]
    });
  }
  
  setItemClass(id: string): string {
    if (id.toLowerCase() === this.selected.toLowerCase()) {
      return "item selected";
    }
    return "item";
  }

  getListHeight(): string {
    if (this.report.periods && this.report.periods.length > 0) {
      const length = (this.report.periods.length+1) * 22;
      return `height: ${length}px;`;
    }
    return `height: 30px;`;
  }

  setPeriods() {
    this.periods = [];
    if (this.report.periods) {
      this.report.periods.sort((a,b) => a.compareTo(b));
      this.report.periods.forEach(prd => {
        const id = `${prd.month.getUTCMonth() + 1}/${prd.month.getUTCFullYear()}`;
        this.periodMap.set(id, prd);
        let label = '';
        if (prd.periods) {
          prd.periods.forEach(prds => {
            if (label !== '') {
              label += ",";
            }
            label += `${prds.getUTCMonth() + 1}/${prds.getUTCDate()}`;
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

  getUTCDateString(date: Date): string {
    let answer = `${date.getUTCFullYear()}-`;
    if (date.getUTCMonth() < 9) {
      answer += '0';
    }
    answer += `${date.getUTCMonth() + 1}-`;
    if (date.getUTCDate() < 10) {
      answer += '0';
    }
    answer += `${date.getUTCDate()}`;
    return answer;
  }

  onMovePeriod(direction: string) {
    const frmPrd = this.periodMap.get(this.selected);
    if (frmPrd) {
      const fromMonth = this.getUTCDateString(frmPrd.month);
      let toMonth = this.getUTCDateString(frmPrd.month);
      if (direction.toLowerCase().substring(0,1) === 'b') {
        const month = new Date(Date.UTC(frmPrd.month.getUTCFullYear(), 
          frmPrd.month.getUTCMonth() - 1, 1));
        toMonth = this.getUTCDateString(month);
      } else {
        const month = new Date(Date.UTC(frmPrd.month.getUTCFullYear(), 
          frmPrd.month.getUTCMonth() + 1, 1));
        toMonth = this.getUTCDateString(month);
      }
      this.authService.statusMessage = "Moving weeks between periods"
      this.dialogService.showSpinner();
      this.siteService.updateForecastReport(this.teamid, this.site.id, 
        this.report.id, 'move', `${fromMonth}|${toMonth}`).subscribe({
        next: (data: SiteResponse) => {
          this.dialogService.closeSpinner();
          if (data && data != null && data.site) {
            this.site = new Site(data.site);
            this.changed.emit(new Site(data.site));
            if (this.site.forecasts) {
              this.site.forecasts.forEach(rpt => {
                if (rpt.id === this.report.id) {
                  this.report = rpt;
                }
              })
            }
          }
        },
        error: (err: SiteResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      });
    }
  }

  onAddOutOfCycle() {
    const newdate = new Date(this.periodForm.value.newdate);
    this.dialogService.showSpinner();
    this.siteService.updateForecastReport(this.teamid, this.site.id, 
      this.report.id, 'addperiod', this.getUTCDateString(newdate)).subscribe({
      next: (data: SiteResponse) => {
        this.dialogService.closeSpinner();
        if (data && data != null && data.site) {
          this.site = new Site(data.site);
          this.changed.emit(new Site(data.site));
          if (this.site.forecasts) {
            this.site.forecasts.forEach(rpt => {
              if (rpt.id === this.report.id) {
                this.report = rpt;
              }
            })
          }
        }
      },
      error: (err: SiteResponse) => {
        this.dialogService.closeSpinner();
        this.authService.statusMessage = err.exception;
      }
    });
  
  }
}
