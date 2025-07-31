import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { ListItem } from 'src/app/generic/button-list/listitem';
import { DeletionConfirmationComponent } from 'src/app/generic/deletion-confirmation/deletion-confirmation.component';
import { EmployeeLaborCode } from 'src/app/models/employees/employee';
import { CofSReport, CofSSection } from 'src/app/models/sites/cofsreport';import { LaborCode } from 'src/app/models/sites/laborcode';
import { ISite, Site } from 'src/app/models/sites/site';
import { ITeam, Team } from 'src/app/models/teams/team';
import { SiteResponse } from 'src/app/models/web/siteWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
    selector: 'app-site-editor-reports-cofs',
    templateUrl: './site-editor-reports-cofs.component.html',
    styleUrls: ['./site-editor-reports-cofs.component.scss'],
    providers: [
        { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
        },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    ],
    standalone: false
})
export class SiteEditorReportsCofsComponent {
  private _site: Site = new Site();
  @Input()
  public set site(s: ISite) {
    this._site = new Site(s);
    this.setReportList();
  }
  get site(): Site {
    return this._site;
  }
  private _team: Team = new Team();
  @Input()
  public set team(t: ITeam) {
    this._team = new Team(t);
  }
  get team(): Team {
    return this._team;
  }
  @Input() width: number = 1000;
  @Output() changed = new EventEmitter<Site>();
  reportList: ListItem[] = [];
  selected: CofSReport = new CofSReport();
  reportForm: FormGroup;
  descIndex: number = 2;

  constructor(
    protected authService: AuthService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected dialogService: DialogService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.reportForm = this.fb.group({
      name: ['', [Validators.required]],
      short: ['', [Validators.required]],
      start: [new Date(), [Validators.required]],
      end: [new Date(), [Validators.required]],
      unit: ['', [Validators.required]],
      past: false,
    });
    const isite = this.siteService.getSite();
    if (isite) {
      this.site = isite;
    }
    this.setReportList();
    const iteam = this.teamService.getTeam();
    if (iteam) {
      this.team = iteam;
    }
  }

  setReportList() {
    const showPast: boolean = this.reportForm.controls['past'].value;
    this.reportList = [];
    this.reportList.push(new ListItem('new', 'Add New CofS Report'));
    const now = new Date();
    if (this.site.cofs && this.site.cofs.length > 0) {
      this.site.cofs.sort((a,b) => b.compareTo(a));
      this.site.cofs.forEach(rpt => {
        if (showPast || rpt.enddate.getTime() > now.getTime()) {
          const lbl = `${rpt.name} - (${rpt.reportPeriod()})`;
          this.reportList.push(new ListItem(`${rpt.id}`, lbl));
        }
      });
    }
  }

  setListClass(id: string) {
    if ((id === 'new' && this.selected.id <= 0)
      || (`${this.selected.id}` === id)) {
      return "item selected";
     }
     return "item";
  }

  selectReport(id: string) {
    if (id === 'new') {
      this.selected = new CofSReport();
    } else {
      this.site.cofs.forEach(rpt => {
        if (`${rpt.id}` === id) {
          this.selected = new CofSReport(rpt);
          if (this.selected.sections.length === 0
            && this.selected.companies.length > 0) {
            this.dialogService.showSpinner();
            this.siteService.updateCofSReport(this.team.id, this.site.id,
            rpt.id, 'convert', '').subscribe({
              next: (resp: SiteResponse) => {
                this.dialogService.closeSpinner();
                if (resp && resp.site) {
                  this.site = resp.site;
                  this.site.cofs.forEach(crpt => {
                    if (crpt.id === this.selected.id) {
                      this.selected = new CofSReport(crpt);
                    }
                  });
                }
              },
              error: (err: SiteResponse) => {
                this.dialogService.closeSpinner();
                this.authService.statusMessage = err.exception;
              }
            });
          }
        }
      });
    }
    this.setReportForm();
  }

  setReportForm() {
    this.reportForm.controls['name'].setValue(this.selected.name);
    this.reportForm.controls['short'].setValue(this.selected.shortname);
    this.reportForm.controls['unit'].setValue(this.selected.unit);
    this.reportForm.controls['start'].setValue(this.selected.startdate);
    this.reportForm.controls['end'].setValue(this.selected.enddate);
  }

  // this code section will be used by the application to convert old company
  // based CofS Reports to Section Based Reports
  convertCofSReport(rpt: CofSReport): CofSReport {
    rpt.sections = [];
    let exercises = 0;
    rpt.companies.sort((a,b) => a.compareTo(b));
    for (let i=0; i < rpt.companies.length; i++) {
      const co = rpt.companies[i];
      const sect = new CofSSection();
      sect.id = i+1;
      sect.company = co.id;
      sect.label = co.id.toUpperCase();
      sect.signature = co.signature;
      sect.showunit = false;
      co.laborcodes.forEach(lc => {
        if (lc.extension.toLowerCase().indexOf("ex") < 0) {
          sect.laborcodes.push(new EmployeeLaborCode(lc));
        }
      });
      rpt.sections.push(sect);
      if (co.exercises) {
        const exSect = new CofSSection();
        exSect.id = rpt.companies.length + exercises;
        exSect.company = co.id;
        exSect.label = co.id.toUpperCase();
        exSect.signature = co.signature;
        exSect.showunit = false;
        co.laborcodes.forEach(lc => {
          if (lc.extension.toLowerCase().indexOf("ex") >= 0) {
            exSect.laborcodes.push(new EmployeeLaborCode(lc));
          }
        });
        rpt.sections.push(exSect);
        exercises++;
      }
    }
    rpt.sections.sort((a,b) => a.compareTo(b));
    return rpt;
  }

  setInputStyle(field: string): string {
    if (this.reportForm.controls[field].hasError('required')) {
      return "width: 99%;background-color: pink;";
    }
    return "width: 99%;background-color: white;";
  }

  onChange(site: Site) {
    this.site = site;
    this.changed.emit(site);
  }

  addReport() {
    if (this.reportForm.valid) {
      let sDate = new Date(this.reportForm.value.start);
      sDate = new Date(Date.UTC(sDate.getUTCFullYear(), sDate.getUTCMonth(), 
        sDate.getUTCDate(), 0, 0, 0, 0));
      let eDate = new Date(this.reportForm.value.end);
      eDate = new Date(Date.UTC(eDate.getUTCFullYear(), eDate.getUTCMonth(), 
        eDate.getUTCDate(), 0, 0, 0, 0));
      this.dialogService.showSpinner();
      this.siteService.createCofSReport(this.team.id, this.site.id,
      this.reportForm.value.name, this.reportForm.value.short, 
      this.reportForm.value.unit, sDate, eDate).subscribe({
        next: (resp: SiteResponse) => {
          this.dialogService.closeSpinner();
          if (resp && resp.site) {
            this.site = resp.site;
            this.site.cofs.sort((a,b) => a.compareTo(b))
            let maxid = -1;
            let srpt = new CofSReport();
            this.site.cofs.forEach(rpt => {
              if (rpt.id > maxid) {
                srpt = new CofSReport(rpt);
                maxid = srpt.id;
              }
            });
            this.selected = new CofSReport(srpt);
            this.changed.emit(new Site(resp.site));
          }
        },
        error: (err: SiteResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      });
    }
  }

  updateReport(field: string) {
    if (this.selected.id > 0) {
      let sValue = '';
      if (field.toLowerCase() === 'start' || field.toLowerCase() === 'end') {
        const tDate = new Date(this.reportForm.controls[field].value);
        if (tDate.getUTCMonth() < 9) {
          sValue = '0';
        }
        sValue += `${tDate.getUTCMonth() + 1}/`;
        if (tDate.getUTCDate() < 10) {
          sValue += '0';
        }
        sValue += `${tDate.getUTCDate()}/${tDate.getUTCFullYear()}`;
      } else {
        sValue = this.reportForm.controls[field].value;
      }
      this.dialogService.showSpinner();
      this.siteService.updateCofSReport(this.team.id, this.site.id, 
      this.selected.id, field, sValue).subscribe({
        next: (resp: SiteResponse) => {
          this.dialogService.closeSpinner();
          if (resp && resp.site) {
            this.site = resp.site;
            if (this.selected.id > 0) {
              this.site.cofs.forEach(rpt => {
                if (rpt.id === this.selected.id) {
                  this.selected = new CofSReport(rpt);
                }
              });
            }
            this.changed.emit(new Site(resp.site));
          }
        },
        error: (err: SiteResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      });
    } else if (field.toLowerCase() === 'start') {
      let sDate = new Date(this.reportForm.value.start);
      sDate = new Date(Date.UTC(sDate.getUTCFullYear(), sDate.getUTCMonth(), 
        sDate.getUTCDate(), 0, 0, 0, 0));
      this.reportForm.controls['end'].setValue(sDate);
    }
  }

  deleteReport() {
    if (this.selected.id > 0) {
      const dialogRef = this.dialog.open(DeletionConfirmationComponent, {
        data: {title: 'Confirm CofS Report Deletion', 
        message: 'Are you sure you want to delete this CofS Report?'},
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result === 'yes') {
          this.dialogService.showSpinner();
          this.siteService.deleteCofSReport(this.team.id, 
            this.site.id, this.selected.id ).subscribe({
            next: (data: SiteResponse) => {
              this.dialogService.closeSpinner();
              if (data && data != null && data.site) {
                this.site = new Site(data.site);
                this.changed.emit(new Site(data.site));
                this.selected = new CofSReport();
                this.selected.id = -1;
                this.setReportForm();
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
  
  clearReport() {
    this.selected = new CofSReport();
    this.selected.id = -1;
    this.setReportForm();
  }
}
