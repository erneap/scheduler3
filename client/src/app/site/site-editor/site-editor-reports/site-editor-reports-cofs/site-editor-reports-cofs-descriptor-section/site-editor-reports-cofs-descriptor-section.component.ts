import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ListItem } from 'src/app/generic/button-list/listitem';
import { DeletionConfirmationComponent } from 'src/app/generic/deletion-confirmation/deletion-confirmation.component';
import { EmployeeLaborCode } from 'src/app/models/employees/employee';
import { CofSReport, CofSSection, ICofSReport } from 'src/app/models/sites/cofsreport';
import { ISite, Site } from 'src/app/models/sites/site';
import { Company } from 'src/app/models/teams/company';
import { ITeam, Team } from 'src/app/models/teams/team';
import { SiteResponse } from 'src/app/models/web/siteWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
    selector: 'app-site-editor-reports-cofs-descriptor-section',
    templateUrl: './site-editor-reports-cofs-descriptor-section.component.html',
    styleUrls: ['./site-editor-reports-cofs-descriptor-section.component.scss'],
    standalone: false
})
export class SiteEditorReportsCofsDescriptorSectionComponent {
  private _site: Site = new Site();
  @Input()
  public set site(s: ISite) {
    this._site = new Site(s);
    this.setLaborCodes();
  }
  get site(): Site {
    return this._site;
  }
  private _report: CofSReport = new CofSReport();
  @Input()
  public set report(r: ICofSReport) {
    this._report = new CofSReport(r);
    this.setSections();
    if (this.selected.id > 0) {
      this._report.sections.forEach(sect => {
        if (sect.id === this.selected.id) {
          this.selected = new CofSSection(sect);
        }
      })
    }
  }
  get report(): CofSReport {
    return this._report;
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
  @Input() width: number = 350;
  @Output() changed = new EventEmitter<Site>();
  sections: ListItem[] = [];
  laborcodes: ListItem[] = [];
  companylist: Company[] = [];
  selected: CofSSection;
  sectionForm: FormGroup;
  showMoveUp: boolean = false;
  showMoveDown: boolean = false;

  constructor(
    protected authService: AuthService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected dialogService: DialogService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.selected = new CofSSection();
    this.selected.id = -1;

    this.sectionForm = this.fb.group({
      company: ['', [Validators.required]],
      label: ['', [Validators.required]],
      signature: ['', [Validators.required]],
      showunit: false,
    });

    const isite = this.siteService.getSite();
    if (isite) {
      this.site = isite;
    }
    const iteam = this.teamService.getTeam();
    if (iteam) {
      this.team = iteam;
    }
  }

  setSections() {
    this.sections = [];
    this.sections.push(new ListItem('-1', 'Add New Section'));
    if (this.report.sections) {
      this.report.sections.sort((a,b) => a.compareTo(b));
      this.report.sections.forEach(sect => {
        this.sections.push(new ListItem(`${sect.id}`, sect.label))
      });
    }
  }

  setLaborCodes() {
    this.laborcodes = [];
    // get the company id, then from the site forecast reports, pull all the
    // laborcodes for the report period.
    const companyid = this.sectionForm.value.company;
    if (companyid && companyid !== '') {
      if (this.site.forecasts) {
        this.site.forecasts.forEach(fsct => {
          if (fsct.companyid && fsct.companyid === companyid
            && (fsct.startDate.getTime() <= this.report.enddate.getTime()
            && fsct.endDate.getTime() >= this.report.startdate.getTime())
          ) {
            if (fsct.laborCodes && fsct.laborCodes.length > 0) {
              fsct.laborCodes.forEach(lc => {
                const label = `${lc.chargeNumber}-${lc.extension}`;
                this.laborcodes.push(new ListItem(label, label))
              });
            }
          }
        });
      }
    }
    this.laborcodes.sort((a,b) => (a.label < b.label) ? -1 : 1)
  }

  setCompanyList() {
    this.companylist = [];
    this.team.companies.forEach(co => {
      this.companylist.push(new Company(co));
    });
    this.companylist.sort((a,b) => a.compareTo(b));
  }

  setSectionItem(id: string): string {
    if ((id === '-1' && this.selected.id <= 0) 
      || (`${this.selected.id}` === id)) {
      return 'sectionitem selected';
    }
    return 'sectionitem';
  }

  onSelectSection(id: string) {
    this.selected = new CofSSection();
    this.showMoveDown = false;
    this.showMoveUp = false;
    const sid = Number(id);
    if (sid > 0) {
      for (let s = 0; s < this.report.sections.length; s++) {
        const sect = this.report.sections[s];
        if (sect.id === sid) {
          this.selected = new CofSSection(sect);
          if (s > 0) {
            this.showMoveUp = true;
          }
          if (s < this.report.sections.length - 1) {
            this.showMoveDown = true;
          }
        }
      }
    }
    this.setSectionForm();
  }

  setSectionForm() {
    this.sectionForm.controls['company'].setValue(this.selected.company);
    this.sectionForm.controls['label'].setValue(this.selected.label);
    this.sectionForm.controls['signature'].setValue(this.selected.signature);
    this.sectionForm.controls['showunit'].setValue(this.selected.showunit);
    this.setLaborCodes();
  }

  setInputStyle(field: string): string {
    if (this.sectionForm.controls[field].hasError('required')) {
      return "width: 99%;background-color: pink;";
    }
    return "width: 99%;background-color: white;";
  }

  setLaborClass(id: string) {
    const parts = id.split("-");
    let found = false;
    this.selected.laborcodes.forEach(lc => {
      if (lc.chargeNumber === parts[0] && lc.extension === parts[1]) {
        found = true;
      }
    });
    if (found) {
      return 'laboritem selected';
    }
    return 'laboritem';
  }

  updateSection(field: string) {
    if (this.selected.id <= 0 && field.toLowerCase() === 'company') {
      this.setLaborCodes();
    } else if (this.selected.id > 0) {
      let sValue = '';
      if (field.toLowerCase() === 'showunit') {
        sValue = `${this.sectionForm.controls[field].value}`;
      } else {
        sValue = this.sectionForm.controls[field].value;
      }
      this.dialogService.showSpinner();
      this.siteService.updateCofSReportSection(this.team.id, this.site.id,
      this.report.id, this.selected.id, field, sValue).subscribe({
        next: (resp: SiteResponse) => {
          this.dialogService.closeSpinner();
          if (resp && resp.site) {
            this.site = resp.site;
            this.site.cofs.forEach(rpt => {
              if (rpt.id === this.report.id) {
                this.report = rpt;
              }
            });
            this.changed.emit(new Site(resp.site));
          }
        },
        error: (err: SiteResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      })
    }
  }

  updateSectionLaborCode(id: string) {
    let action = 'addlaborcode';
    let found = false;
    const parts = id.split('-');
    this.selected.laborcodes.forEach(lc => {
      if (lc.chargeNumber === parts[0] && lc.extension === parts[1]) {
        action = 'removelaborcode';
      }
    });
    if (this.selected.id <= 0) {
      if (action === 'removelaborcode') {
        found = false;
        for (let i=0; i < this.selected.laborcodes.length && !found; i++) {
          const lc = this.selected.laborcodes[i];
          if (lc.chargeNumber === parts[0] && lc.extension === parts[1]) {
            found = true;
            this.selected.laborcodes.splice(i, 1);
          }
        }
      } else {
        this.selected.laborcodes.push(new EmployeeLaborCode({
          chargeNumber: parts[0],
          extension: parts[1],
        }));
      }
    } else {
      this.dialogService.showSpinner();
      this.siteService.updateCofSReportSection(this.team.id, this.site.id, 
        this.report.id, this.selected.id, action, id).subscribe({
        next: (resp: SiteResponse) => {
          this.dialogService.closeSpinner();
          if (resp && resp.site) {
            this.site = resp.site;
            this.site.cofs.forEach(rpt => {
              if (rpt.id === this.report.id) {
                this.report = rpt;
              }
            });
            this.changed.emit(new Site(resp.site));
          }
        },
        error: (err: SiteResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      })
    }
  }

  moveSection(direction: string) {
    if (this.selected.id > 0) {
      this.dialogService.showSpinner();
      this.siteService.updateCofSReportSection(this.team.id, this.site.id, 
        this.report.id, this.selected.id, 'move', direction).subscribe({
        next: (resp: SiteResponse) => {
          this.dialogService.closeSpinner();
          if (resp && resp.site) {
            this.site = resp.site;
            this.site.cofs.forEach(rpt => {
              if (rpt.id === this.report.id) {
                this.report = rpt;
                if (this.selected.id > 0) {
                  this.report.sections.forEach(sect => {
                    if (this.selected.id === sect.id) {
                      this.selected = new CofSSection(sect);
                      this.setSectionForm();
                    }
                  });
                }
              }
            });
            this.changed.emit(new Site(resp.site));
          }
        },
        error: (err: SiteResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      })
    }
  }

  addNewSection() {
    if (this.sectionForm.valid) {
      this.dialogService.showSpinner();
      this.siteService.addCofSReportSection(this.team.id, this.site.id, 
      this.report.id, this.selected.id, this.sectionForm.value.company,
      this.sectionForm.value.label, this.sectionForm.value.signature, 
      this.sectionForm.value.showunit, this.selected.laborcodes).subscribe({
        next: (resp: SiteResponse) => {
          this.dialogService.closeSpinner();
          if (resp && resp.site) {
            this.site = resp.site;
            this.site.cofs.forEach(rpt => {
              if (rpt.id === this.report.id) {
                this.report = rpt;
                if (this.selected.id <= 0) {
                  this.report.sections.sort((a,b) => a.compareTo(b));
                  this.selected = new CofSSection(
                    this.report.sections[this.report.sections.length - 1]);
                }
              }
            });
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

  deleteSection() {
    if (this.selected.id > 0) {
      const dialogRef = this.dialog.open(DeletionConfirmationComponent, {
        data: {title: 'Confirm CofS Section Deletion', 
        message: 'Are you sure you want to delete this CofS Report Section?'},
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result === 'yes') {
          this.dialogService.showSpinner();
          this.siteService.deleteCofSReportSection(this.team.id, 
            this.site.id, this.report.id, this.selected.id ).subscribe({
            next: (data: SiteResponse) => {
              this.dialogService.closeSpinner();
              if (data && data != null && data.site) {
                this.site = new Site(data.site);
                this.site.cofs.forEach(rpt => {
                  if (rpt.id === this.report.id) {
                    this.report = rpt;
                  }
                });
                this.changed.emit(new Site(data.site));
                this.selected = new CofSSection();
                this.selected.id = -1;
                this.setSectionForm();
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
