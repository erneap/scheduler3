import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ListItem } from 'src/app/generic/button-list/listitem';
import { EmployeeLaborCode } from 'src/app/models/employees/employee';
import { CofSReport, CofSSection } from 'src/app/models/sites/cofsreport';
import { LaborCode } from 'src/app/models/sites/laborcode';
import { ISite, Site } from 'src/app/models/sites/site';
import { ITeam, Team } from 'src/app/models/teams/team';
import { SiteResponse } from 'src/app/models/web/siteWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';
import { SiteReportEditorComponent } from 'src/app/site/site-report-editor/site-report-editor.component';

@Component({
  selector: 'app-site-editor-reports-cofs',
  templateUrl: './site-editor-reports-cofs.component.html',
  styleUrls: ['./site-editor-reports-cofs.component.scss']
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
    this.reportList = [];
    this.reportList.push(new ListItem('new', 'Add New CofS Report'));
    const now = new Date();
    if (this.site.cofs && this.site.cofs.length > 0) {
      this.site.cofs.sort((a,b) => a.compareTo(b));
      this.site.cofs.forEach(rpt => {
        if (rpt.enddate.getTime() > now.getTime()) {
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

  }

  updateReport(field: string) {

  }

  deleteReport() {

  }
  
  clearReport() {
    this.selected = new CofSReport();
    this.selected.id = -1;
    this.setReportForm();
  }
}
