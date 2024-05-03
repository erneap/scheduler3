import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ListItem } from 'src/app/generic/button-list/listitem';
import { DeletionConfirmationComponent } from 'src/app/generic/deletion-confirmation/deletion-confirmation.component';
import { ForecastReport } from 'src/app/models/sites/forecastreport';
import { ISite, Site } from 'src/app/models/sites/site';
import { ITeam, Team } from 'src/app/models/teams/team';
import { SiteResponse } from 'src/app/models/web/siteWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-site-editor-reports-forecast',
  templateUrl: './site-editor-reports-forecast.component.html',
  styleUrls: ['./site-editor-reports-forecast.component.scss']
})
export class SiteEditorReportsForecastComponent {
  private _site: Site = new Site();
  @Input()
  public set site(s: ISite) {
    this._site = new Site(s);
    this.getReports();
  }
  get site(): Site {
    return this._site;
  }
  private _team: Team = new Team();
  @Input()
  public set team(t: ITeam) {
    this._team = new Team(t);
    this.setCompanyList();
  }
  get team(): Team {
    return this._team;
  }
  @Input() width: number = 790;
  @Output() changed = new EventEmitter<Site>();
  reports: ListItem[] = [];
  selected: ForecastReport;
  reportForm: FormGroup;
  companylist: ListItem[] = [];

  constructor(
    protected authService: AuthService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected dialogService: DialogService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.selected = new ForecastReport();
    this.selected.id = -1;
    const isite = this.siteService.getSite();
    if (isite) {
      this.site = isite;
    }
    const iteam = this.teamService.getTeam();
    if (iteam) {
      this.team = new Team(iteam);
    }
    this.reportForm = this.fb.group({
      name: ['', [Validators.required]],
      start: [new Date(), [Validators.required]],
      end: [new Date(), [Validators.required]],
      period: [5, [Validators.required]],
      companyid: ["", [Validators.required]]
    })
  }

  dateString(dt: Date): string {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
      "Sep", "Oct", "Nov", "Dec" ];
    let answer = '';
    if (dt.getDate() < 10) {
      answer = '0';
    }
    answer += `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}`;
    return answer;
  }

  setItemClass(id: string): string {
    const sid = `${this.selected.id}`;
    if (sid === id) {
      return 'item selected';
    }
    return 'item';
  }

  getReports() {
    this.reports = [];
    this.reports.push(new ListItem('-1', 'Add New Report'));
    const now = new Date();
    if (this.site.forecasts) {
      this.site.forecasts.sort((a,b) => a.compareTo(b));
      this.site.forecasts.forEach(rpt => {
        if (rpt.show(now)) {
          const label = `(${rpt.companyid?.toUpperCase()}) ${rpt.name} `
            + `(${this.dateString(rpt.startDate)} - `
            + `${this.dateString(rpt.endDate)})`;
          this.reports.push(new ListItem(`${rpt.id}`, label));
        }
      });
    }
  }

  setCompanyList() {
    this.companylist = [];
    this.companylist.push(new ListItem('', ''));
    if (this.team.companies) {
      this.team.companies.sort((a,b) => a.compareTo(b));
      this.team.companies.forEach(co => {
        this.companylist.push(new ListItem(co.id, co.name));
      });
    }
  }

  onSelect(id: string) {
    const sid = Number(id);
    if (sid <= 0) {
      this.selected = new ForecastReport();
      this.selected.id = -1;
    } else {
      if (this.site.forecasts) {
        this.site.forecasts.forEach(rpt => {
          if (rpt.id === sid) {
            this.selected = new ForecastReport(rpt);
          }
        });
      }
    }
    this.setReport();
  }

  setReport() {
    let weekday = '5';
    if (this.selected.periods && this.selected.periods.length > 0) {
      const period = this.selected.periods[0];
      if (period.periods && period.periods.length > 0) {
        weekday = `${period.periods[0].getDay()}`;
      }
    }
    this.reportForm.controls['name'].setValue(this.selected.name);
    this.reportForm.controls['start'].setValue(new Date(this.selected.startDate));
    this.reportForm.controls['end'].setValue(new Date(this.selected.endDate));
    this.reportForm.controls['period'].setValue(weekday);
    this.reportForm.controls['companyid'].setValue((this.selected.companyid) 
      ? this.selected.companyid : '');
  }

  onChange(field: string) {
    if (this.selected.id > 0) {
      const value = this.reportForm.controls[field].value;
      if (value !== null) {
        let outputValue = '';
        if (field === 'start' || field === 'end') {
          outputValue = this.getDateString(value);
        } else {
          outputValue = value;
        }
        this.dialogService.showSpinner();
        this.siteService.updateForecastReport(this.team.id, this.site.id, 
          Number(this.selected), field, outputValue).subscribe({
          next: (data: SiteResponse) => {
            this.dialogService.closeSpinner();
            if (data && data != null && data.site) {
              this.site = new Site(data.site);
              this.changed.emit(new Site(data.site));
            }
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
    this.changed.emit(new Site(site))
    if (this.site.forecasts) {
      this.site.forecasts.forEach(rpt => {
        if (rpt.id === this.selected.id) {
          this.selected = new ForecastReport(rpt);
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
      this.dialogService.showSpinner();
      this.siteService.addForecastReport(this.team.id, this.site.id, 
        company, name, start, end, Number(this.reportForm.value.period))
        .subscribe({
        next: (data: SiteResponse) => {
          this.dialogService.closeSpinner();
          if (data && data != null && data.site) {
            this.site = new Site(data.site);
            this.changed.emit(new Site(data.site));
            if (this.site.forecasts) {
              this.site.forecasts.sort((a,b) => a.compareTo(b));
              this.site.forecasts.forEach(rpt => {
                if (rpt.name === name 
                  && rpt.startDate.getFullYear() === start.getFullYear()
                  && rpt.startDate.getMonth() === start.getMonth()
                  && rpt.startDate.getDate() === start.getDate()) {
                  this.selected = new ForecastReport(rpt);
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

  onClear() {
    this.selected = new ForecastReport();
    this.selected.id = -1;
    this.setReport();
  }

  onDeleteReport() {
    if (this.selected.id > 0) {
      const dialogRef = this.dialog.open(DeletionConfirmationComponent, {
        data: {title: 'Confirm Forecast Report Deletion', 
        message: 'Are you sure you want to delete this Forecast Report?'},
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result === 'yes') {
          const rptID = Number(this.selected);
          this.authService.statusMessage = "Deleting CofS Report";
          this.dialogService.showSpinner();
          this.siteService.deleteForecastReport(this.team.id, 
            this.site.id, rptID ).subscribe({
            next: (data: SiteResponse) => {
              this.dialogService.closeSpinner();
              if (data && data != null && data.site) {
                this.site = new Site(data.site);
                this.changed.emit(new Site(data.site));
                this.selected = new ForecastReport();
                this.selected.id = -1;
              }
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