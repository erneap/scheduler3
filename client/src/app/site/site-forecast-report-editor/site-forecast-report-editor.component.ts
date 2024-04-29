import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { ListItem } from 'src/app/generic/button-list/listitem';
import { DeletionConfirmationComponent } from 'src/app/generic/deletion-confirmation/deletion-confirmation.component';
import { ForecastReport, IForecastReport } from 'src/app/models/sites/forecastreport';
import { ISite, Site } from 'src/app/models/sites/site';
import { Company } from 'src/app/models/teams/company';
import { SiteResponse } from 'src/app/models/web/siteWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-site-forecast-report-editor',
  templateUrl: './site-forecast-report-editor.component.html',
  styleUrls: ['./site-forecast-report-editor.component.scss'],
  providers: [
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true}},
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
  ]
})
export class SiteForecastReportEditorComponent {
  private _site: Site = new Site();
  @Input()
  public set site(iSite: ISite) {
    this._site = new Site(iSite);
    this.setReports();
  }
  get site(): Site {
    return this._site;
  }
  @Output() siteChanged = new EventEmitter<Site>();
  teamid: string;
  reports: ListItem[] = [];
  report: ForecastReport = new ForecastReport();
  selected: string = 'new';
  showSortUp: boolean = true;
  showSortDown: boolean = true;
  reportForm: FormGroup;
  weekdays: string[];
  companyList: Company[];

  constructor(
    protected authService: AuthService,
    protected dialogService: DialogService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.companyList = [];
    const team = this.teamService.getTeam();
    if (team) {
      this.teamid = team.id;
      team.companies.forEach(co => {
        this.companyList.push(new Company(co));
      });
    } else {
      this.teamid = '';
    }
    this.reportForm = this.fb.group({
      name: ['', [Validators.required]],
      start: [new Date(), [Validators.required]],
      end: [new Date(), [Validators.required]],
      period: ["0", [Validators.required]],
      companyid: ["", [Validators.required]]
    });
    this.weekdays = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
      'Friday', 'Saturday'];
  }

  setReports() {
    this.reports = [];
    this.reports.push(new ListItem('new', 'Create New Report'));
    let now = new Date();
    now = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - 1));
    if (this.site.forecasts) {
      this.site.forecasts.forEach(rpt => {
        if (rpt.endDate.getTime() > now.getTime()) {
          const label = `(${rpt.companyid?.toUpperCase()}) ${rpt.name} `
            + `(${this.getDate(rpt.startDate)}-${this.getDate(rpt.endDate)})`;
          this.reports.push(new ListItem(`${rpt.id}`, label));
        }
      });
    }
  }

  setReport() {
    if (this.selected !== 'new') {
      if (this.site.forecasts) {
        this.site.forecasts.forEach(rpt => {
          if (this.selected === `${rpt.id}`) {
            this.report = new ForecastReport(rpt);
            let weekday = 0;
            if (rpt.periods && rpt.periods.length > 0) {
              const prd = rpt.periods[0];
              if (prd.periods && prd.periods.length > 0) {
                weekday = prd.periods[0].getDay();
              }
            }
            this.reportForm.controls['name'].setValue(rpt.name);
            this.reportForm.controls['start'].setValue(rpt.startDate);
            this.reportForm.controls['end'].setValue(rpt.endDate);
            this.reportForm.controls['period'].setValue(`${weekday}`);
            this.reportForm.controls['companyid'].setValue((rpt.companyid) ? rpt.companyid : '');
          }
        });
      }
    } else {
      this.report = new ForecastReport();
      this.reportForm.controls['name'].setValue('');
      this.reportForm.controls['start'].setValue(new Date());
      this.reportForm.controls['end'].setValue(new Date());
      this.reportForm.controls['period'].setValue('5');
      this.reportForm.controls['companyid'].setValue('');
    }
  }
  
  getButtonStyle(id: string): string {
    if (id.toLowerCase() === this.selected.toLowerCase()) {
      return "employee active";
    }
    return "employee";
  }

  getDate(date: Date): string {
    const months: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
      'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  onSelectReport(wid: string) {
    this.selected = wid;
    this.setReport();
  }

  onChange(field: string) {
    if (this.selected !== 'new') {
      const value = this.reportForm.controls[field].value;
      if (value !== null) {
        let outputValue = '';
        if (field === 'start' || field === 'end') {
          outputValue = this.getDateString(value);
        } else {
          outputValue = value;
        }
        this.authService.statusMessage = "Updating Forecast Report";
        this.dialogService.showSpinner();
        this.siteService.updateForecastReport(this.teamid, this.site.id, 
          Number(this.selected), field, outputValue).subscribe({
          next: (data: SiteResponse) => {
            this.dialogService.closeSpinner();
            if (data && data != null && data.site) {
              this.site = new Site(data.site);
              this.siteChanged.emit(new Site(data.site));
              if (this.site.forecasts) {
                this.site.forecasts.sort((a,b) => a.compareTo(b));
                this.setReports();
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

  onSiteChanged(site: Site) {
    this.site = site;
    this.siteChanged.emit(new Site(site))
    if (this.site.forecasts) {
      this.site.forecasts.forEach(rpt => {
        if (`${rpt.id}` === this.selected) {
          this.report = new ForecastReport(rpt);
        }
      });
    }
  }

  onAddReport() {
    if (this.reportForm.valid) {
      const name = this.reportForm.value.name;
      const start = this.reportForm.value.start;
      const end = this.reportForm.value.end;
      const company = this.reportForm.value.companyid;
      this.authService.statusMessage = 'Adding new Forecast Report';
      this.dialogService.showSpinner();
      this.siteService.addForecastReport(this.teamid, this.site.id, 
        company, name, start, end, Number(this.reportForm.value.period))
        .subscribe({
        next: (data: SiteResponse) => {
          this.dialogService.closeSpinner();
          if (data && data != null && data.site) {
            this.site = new Site(data.site);
            this.siteChanged.emit(new Site(data.site));
            if (this.site.forecasts) {
              this.site.forecasts.sort((a,b) => a.compareTo(b));
              this.site.forecasts.forEach(rpt => {
                if (rpt.name === name 
                  && rpt.startDate.getFullYear() === start.getFullYear()
                  && rpt.startDate.getMonth() === start.getMonth()
                  && rpt.startDate.getDate() === start.getDate()) {
                  this.selected = `${rpt.id}`;
                  this.report = new ForecastReport(rpt);
                }
              })
              this.setReports();
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

  onDeleteReport() {
    if (this.selected !== 'new' && this.selected !== '') {
      const dialogRef = this.dialog.open(DeletionConfirmationComponent, {
        data: {title: 'Confirm Forecast Report Deletion', 
        message: 'Are you sure you want to delete this Forecast Report?'},
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result === 'yes') {
          const rptID = Number(this.selected);
          this.authService.statusMessage = "Deleting CofS Report";
          this.dialogService.showSpinner();
          this.siteService.deleteForecastReport(this.teamid, 
            this.site.id, rptID ).subscribe({
            next: (data: SiteResponse) => {
              this.dialogService.closeSpinner();
              if (data && data != null && data.site) {
                this.site = new Site(data.site);
                this.siteChanged.emit(new Site(data.site));
                this.selected = 'new';
                this.setReports();
                this.setReport();
                const site = this.siteService.getSite();
                if (site && data.site.id === site.id) {
                  this.siteService.setSite(new Site(data.site));
                }
                this.teamService.setSelectedSite(new Site(data.site));
              }
              this.authService.statusMessage = "Deletion complete"
            },
            error: (err: SiteResponse) => {
              this.dialogService.closeSpinner();
              this.authService.statusMessage = err.exception;
            }
          });
        }
      });
    } 
  }
}
