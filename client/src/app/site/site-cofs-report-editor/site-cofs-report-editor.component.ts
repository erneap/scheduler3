import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { ListItem } from 'src/app/generic/button-list/listitem';
import { DeletionConfirmationComponent } from 'src/app/generic/deletion-confirmation/deletion-confirmation.component';
import { CofSReport } from 'src/app/models/sites/cofsreport';
import { ISite, Site } from 'src/app/models/sites/site';
import { Team } from 'src/app/models/teams/team';
import { SiteResponse } from 'src/app/models/web/siteWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-site-cofs-report-editor',
  templateUrl: './site-cofs-report-editor.component.html',
  styleUrls: ['./site-cofs-report-editor.component.scss'],
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
export class SiteCofsReportEditorComponent {
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
  team: Team;
  selected: string = 'new';
  assignedCompany: string = '';
  unassignedCompany: string = '';
  reports: ListItem[] = [];
  report: CofSReport = new CofSReport();
  reportForm: FormGroup;
  compUnassigned: ListItem[] = [];
  compAssigned: ListItem[] = [];
  companyForm: FormGroup;
  showSortUp: boolean = true;
  showSortDown: boolean = true;
  laborUnassigned: ListItem[] = [];
  laborAssigned: ListItem[] = [];
  unassignedLabor: string = '';
  assignedLabor: string = '';
  laborForm: FormGroup


  constructor(
    protected authService: AuthService,
    protected dialogService: DialogService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected dialog: MatDialog,
    private fb: FormBuilder
  ) {
    const iTeam = this.teamService.getTeam();
    this.team = new Team(iTeam);
    this.reportForm = this.fb.group({
      name: ['', [Validators.required]],
      short: ['', [Validators.required]],
      start: [new Date(), [Validators.required]],
      end: [new Date(), [Validators.required]],
      unit: ['', [Validators.required]],
    });
    this.companyForm = this.fb.group({
      signature: '',
      exercises: false,
    });
    this.laborForm = this.fb.group({
      chargenumber: ['', [Validators.required]],
      extension: ['', [Validators.required]],
    })
  }

  setReports() {
    this.reports = [];
    this.reports.push(new ListItem('new', 'Add New CofS Report'));
    this.site.cofs.forEach(rpt => {
      const lbl = `${rpt.name} - (${rpt.reportPeriod()})`;
      this.reports.push(new ListItem(`${rpt.id}`, lbl))
    });
  }
  
  getButtonStyle(id: string): string {
    if (id.toLowerCase() === this.selected.toLowerCase()) {
      return "employee active";
    }
    return "employee";
  }

  getAssignedCompanyStyle(id: string): string {
    if (id.toLowerCase() === this.assignedCompany.toLowerCase()) {
      return "company active";
    }
    return "company";
  }

  getUnassignedCompanyStyle(id: string): string {
    if (id.toLowerCase() === this.unassignedCompany.toLowerCase()) {
      return "company active";
    }
    return "company";
  }

  onChange(field: string) {
    if (this.selected !== 'new') {
      const rptID = Number(this.selected);
      let companyid: string | undefined = undefined;
      let value = '';
      switch (field.toLowerCase()) {
        case "short":
          value = this.reportForm.value.short;
          break;
        case "name":
          value = this.reportForm.value.name;
          break;
        case "unit":
          value = this.reportForm.value.unit;
          break;
        case "startdate":
          let dt = new Date(this.reportForm.value.startdate);
          value = this.getDateString(dt);
          break;
        case "enddate":
          let dte = new Date(this.reportForm.value.enddate);
          value = this.getDateString(dte);
          break;
        case "addcompany":
          value = this.unassignedCompany;
          break;
        case "delcompany":
          value = this.assignedCompany;
          break;
        case "signature":
          companyid = this.assignedCompany;
          value = this.companyForm.value.signature;
          break;
        case "exercises":
          companyid = this.assignedCompany;
          value = `${this.companyForm.value.exercises}`;
          break;
        case "addlabor":
          companyid = this.assignedCompany;
          value = this.unassignedLabor;
          break;
        case "dellabor":
          companyid = this.assignedCompany;
          value = this.assignedLabor
          break;
      }
      this.authService.statusMessage = "Updating CofS Report";
      this.dialogService.showSpinner();
      this.siteService.updateCofSReport(this.team.id, 
        this.site.id, rptID, field, value, companyid)
        .subscribe({
        next: (data: SiteResponse) => {
          this.dialogService.closeSpinner();
          if (data && data != null && data.site) {
            this.site = new Site(data.site);
            this.siteChanged.emit(new Site(data.site));
            this.setReports();
            this.setReport();
            if (companyid) {
              this.onSelectAssignedCompany(companyid);
            }
            const site = this.siteService.getSite();
            if (site && data.site.id === site.id) {
              this.siteService.setSite(new Site(data.site));
            }
            this.teamService.setSelectedSite(new Site(data.site));
          }
          this.authService.statusMessage = "Update complete"
        },
        error: (err: SiteResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      });
    }
  }

  getDateString(dt: Date) : string {
    let answer = '';
    if (dt.getMonth() < 9) {
      answer += "0"
    }
    answer += `${dt.getMonth() + 1}/`;
    if (dt.getDate() < 10) {
      answer += '0';
    }
    answer += `${dt.getDate()}/${dt.getFullYear()}`;
    return answer;
  }

  onAddReport() {
    this.authService.statusMessage = "Adding CofS report";
    this.dialogService.closeSpinner();
    this.siteService.createCofSReport(this.team.id, 
      this.site.id, this.reportForm.value.name, 
      this.reportForm.value.short, 
      this.reportForm.value.unit,
      new Date(this.reportForm.value.start), 
      new Date(this.reportForm.value.end)).subscribe({
      next: (data: SiteResponse) => {
        this.dialogService.closeSpinner();
        if (data && data != null && data.site) {
          this.site = new Site(data.site);
          this.siteChanged.emit(new Site(data.site));
          this.setReports();
          const site = this.siteService.getSite();
          if (site && data.site.id === site.id) {
            this.siteService.setSite(new Site(data.site));
          }
          this.teamService.setSelectedSite(new Site(data.site));
        }
        this.authService.statusMessage = "Addition complete"
      },
      error: (err: SiteResponse) => {
        this.dialogService.closeSpinner();
        this.authService.statusMessage = err.exception;
      }
    });
  }

  setReport() {
    if (this.selected !== 'new') {
      if (this.site.cofs) {
        this.site.cofs.forEach(rpt => {
          if (this.selected === `${rpt.id}`) {
            this.report = new CofSReport(rpt);
            this.reportForm.controls['name'].setValue(rpt.name);
            this.reportForm.controls['short'].setValue(rpt.shortname);
            this.reportForm.controls['start'].setValue(rpt.startdate);
            this.reportForm.controls['end'].setValue(rpt.enddate);
            this.reportForm.controls['unit'].setValue(rpt.unit)
          }
        });
      }
    } else {
      this.report = new CofSReport();
      this.reportForm.controls['name'].setValue('');
      this.reportForm.controls['short'].setValue('');
      this.reportForm.controls['unit'].setValue('');
      this.reportForm.controls['start'].setValue(new Date());
      this.reportForm.controls['end'].setValue(new Date());
    }
    this.compAssigned = [];
    this.compUnassigned = [];
    this.team.companies.sort((a,b) => a.compareTo(b));
    this.team.companies.forEach(co => {
      let found = false;
      this.report.companies.forEach(c => {
        if (c.id === co.id) {
          found = true;
          const li = new ListItem(co.id, co.name);
          li.sortid = c.sortid;
          this.compAssigned.push(li);
        }
      });
      if (!found) {
        this.compUnassigned.push(new ListItem(co.id, co.name));
      }
    });
    this.compAssigned.sort((a,b) => a.compareTo(b));
    if (this.unassignedCompany !== '') {
      this.onSelectUnassignedCompany(this.unassignedCompany);
    }
    if (this.assignedCompany !== '') {
      this.onSelectAssignedCompany(this.assignedCompany);
    }
    this.showSortDown = false;
    this.showSortUp = false;
  }

  onSelectReport(id: string) {
    this.selected = id;
    this.setReport();
  }

  onSelectUnassignedCompany(id: string) {
    if (this.unassignedCompany === id) {
      this.unassignedCompany = '';
    } else {
      this.unassignedCompany = id;
    }
  }

  onSelectAssignedCompany(id: string) {
    this.laborAssigned = [];
    this.laborUnassigned = [];
    const iSite = this.siteService.getSite();
    if (iSite) {
      const site = new Site(iSite);
      site.forecasts.forEach(fcst => {
        if (fcst.startDate.getTime() <= this.report.enddate.getTime() &&
        fcst.endDate.getTime() >= this.report.startdate.getTime()) {
          if (fcst.laborCodes) {
            fcst.laborCodes.forEach(lc => {
              let label = `${lc.chargeNumber}-${lc.extension}`;
              this.laborUnassigned.push(new ListItem(label, label));
            });
          }
        }
      });
    }
    this.showSortDown = false;
    this.showSortUp = false;
    if (this.assignedCompany === id) {
      this.assignedCompany = '';
    } else {
      this.assignedCompany = id;
    }
    if (this.assignedCompany === '') {
      this.companyForm.controls['signature'].setValue('');
      this.companyForm.controls['exercises'].setValue(false);
    } else {
      this.report.companies.sort((a,b) => a.compareTo(b))
      for (let c = 0; c < this.report.companies.length; c++) {
        const co = this.report.companies[c];
        if (co.id === this.assignedCompany) {
          this.showSortUp = (c > 0);
          this.showSortDown = (c < this.report.companies.length - 1);
          this.companyForm.controls['signature']
            .setValue(co.signature);
          this.companyForm.controls['exercises']
            .setValue(co.exercises);
          co.laborcodes.forEach(lc => {
            let label = `${lc.chargeNumber}-${lc.extension}`;
            let bFound = false;
            for (let i=0; i < this.laborUnassigned.length && !bFound; i++) {
              if (label === this.laborUnassigned[i].id) {
                bFound = true;
                this.laborUnassigned.splice(i, 1);
              }
            }
            this.laborAssigned.push(new ListItem(label, label));
          });
        }
      }
    }
  }

  onChangeSort(direction: string) {
    const rptID = Number(this.selected);
    this.authService.statusMessage = "Changing Report Company Sort";
    this.dialogService.showSpinner()
    this.siteService.updateCofSReport(this.team.id, 
      this.site.id, rptID, "sort", direction, 
      this.assignedCompany).subscribe({
      next: (data: SiteResponse) => {
        this.dialogService.closeSpinner();
        if (data && data != null && data.site) {
          this.site = new Site(data.site);
          this.siteChanged.emit(new Site(data.site));
          this.setReports();
          this.setReport();
          const site = this.siteService.getSite();
          if (site && data.site.id === site.id) {
            this.siteService.setSite(new Site(data.site));
          }
          this.teamService.setSelectedSite(new Site(data.site));
        }
        this.authService.statusMessage = "Addition complete"
      },
      error: (err: SiteResponse) => {
        this.dialogService.closeSpinner();
        this.authService.statusMessage = err.exception;
      }
    });
  }

  onSelectUnassignedLabor(id: string) {
    if (this.unassignedLabor === id) {
      this.unassignedLabor = '';
    } else {
      this.unassignedLabor = id;
    }
  }

  onSelectAssignedLabor(id: string) {
    if (this.assignedLabor === id) {
      this.assignedLabor = '';
    } else {
      this.assignedLabor = id;
    }
  }

  getUnassignedLaborStyle(id: string): string {
    if (id === this.unassignedLabor) {
      return "company active";
    }
    return "company";
  }

  getAssignedLaborStyle(id: string): string {
    if (id === this.assignedLabor) {
      return "company active";
    }
    return "company";
  }

  onAddLaborCharge() {
    const chgNo = this.laborForm.value.chargenumber;
    const ext = this.laborForm.value.extension;
    const rptID = Number(this.selected);
    const companyid = this.assignedCompany;
    const field = "addlabor";
    const value = `${chgNo}-${ext}`;
    this.authService.statusMessage = "Updating CofS Report";
    this.dialogService.showSpinner();
    this.siteService.updateCofSReport(this.team.id, 
      this.site.id, rptID, field, value, companyid)
      .subscribe({
      next: (data: SiteResponse) => {
        this.dialogService.closeSpinner();
        if (data && data != null && data.site) {
          this.site = new Site(data.site);
          this.siteChanged.emit(new Site(data.site));
          this.setReports();
          this.setReport();
          if (companyid) {
            this.onSelectAssignedCompany(companyid);
          }
          const site = this.siteService.getSite();
          if (site && data.site.id === site.id) {
            this.siteService.setSite(new Site(data.site));
          }
          this.teamService.setSelectedSite(new Site(data.site));
        }
        this.authService.statusMessage = "Addition complete"
      },
      error: (err: SiteResponse) => {
        this.dialogService.closeSpinner();
        this.authService.statusMessage = err.exception;
      }
    });
  }

  onDeleteReport() {
    if (this.selected !== 'new' && this.selected !== '') {
      const dialogRef = this.dialog.open(DeletionConfirmationComponent, {
        data: {title: 'Confirm CofS Report Deletion', 
        message: 'Are you sure you want to delete this CofS Report?'},
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result === 'yes') {
          const rptID = Number(this.selected);
          this.authService.statusMessage = "Deleting CofS Report";
          this.dialogService.showSpinner();
          this.siteService.deleteCofSReport(this.team.id, this.site.id, rptID ).subscribe({
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
