import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Employee } from 'src/app/models/employees/employee';
import { LeaveDay } from 'src/app/models/employees/leave';
import { Work } from 'src/app/models/employees/work';
import { Site } from 'src/app/models/sites/site';
import { Company } from 'src/app/models/teams/company';
import { Team } from 'src/app/models/teams/team';
import { IngestManualChange } from 'src/app/models/web/internalWeb';
import { IngestChange, IngestResponse } from 'src/app/models/web/siteWeb';
import { AppStateService } from 'src/app/services/app-state.service';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { SiteIngestService } from 'src/app/services/site-ingest.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
    selector: 'app-site-ingest-form',
    templateUrl: './site-ingest-form.component.html',
    styleUrls: ['./site-ingest-form.component.scss'],
    standalone: false
})
export class SiteIngestFormComponent {
  team: Team;
  site: Site;
  width: number = 1158;
  height: number = 700;
  company: Company = new Company();
  myFiles: File[] = [];
  changes: IngestChange[] = [];
  companyForm: FormGroup;
  ingestForm: FormGroup;
  monthShown: Date = new Date();

  constructor(
    protected authService: AuthService,
    protected empService: EmployeeService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected ingestService: SiteIngestService,
    protected stateService: AppStateService,
    protected dialogService: DialogService,
    private fb: FormBuilder
  ) {
    const iTeam = this.teamService.getTeam();
    if (iTeam) {
      this.team = new Team(iTeam);
      this.team.companies.forEach(co => {
        if (co.id === 'rtx') {
          this.company = new Company(co);
        }
      })
    } else {
      this.team = new Team();
    }
    const iSite = this.siteService.getSite();
    if (iSite) {
      this.site = new Site(iSite);
    } else {
      this.site = new Site();
    }
    this.width = this.stateService.viewWidth - 20;
    if (this.width > 1158) this.width = 1158;
    this.companyForm = this.fb.group({
      company: this.company.id,
    });
    this.ingestForm = this.fb.group({
      file: ['', [Validators.required]],
    });

    this.changes = [];
  }

  onChangeCompany() {
    const companyid = this.companyForm.value.company;
    this.team.companies.forEach(co => {
      if (co.id.toLowerCase() === companyid.toLowerCase()) {
        this.company = new Company(co);
      }
    });
  }

  onChangeMonth(dt: Date) {
    this.monthShown = new Date(dt);
  }

  getViewStyle(): string {
    if (this.company.ingest !== 'manual') {
      let height = 35;
      if (this.myFiles.length > 1) {
        let tHeight = this.myFiles.length * 22;
        if (tHeight > height) height = tHeight;
      }
      return `bottom: ${height}px;`;
    } else if (this.changes.length > 0) {
      return 'bottom: 35px;';
    }
    return `bottom: 10px;`;
  }

  formStyle(): string {
    if (this.company.ingest !== 'manual') {
      let height = 35;
      if (this.myFiles.length > 1) {
        let tHeight = this.myFiles.length * 22;
        if (tHeight > height) height = tHeight;
      }
      return `height: ${height}px;`;
    } else if (this.changes.length > 0) {
      return 'height: 35px;';
    }
    return `height: 10px;`;
  }

  onFileChange(event: any) {
    for (let i=0; i < event.target.files.length; i++) {
      this.myFiles.push(event.target.files[i]);
    }
  }

  onClear() {
    this.myFiles = [];
    this.ingestForm.controls["file"].setValue('');
  }

  onSubmit() {
    const iEmp = this.empService.getEmployee();
    if (iEmp) {
      const formData = new FormData();
      const emp = new Employee(iEmp);
      formData.append("team", emp.team);
      formData.append("site", emp.site);
      formData.append("company", this.company.id);
      let month = `${this.monthShown.getUTCFullYear()}-`;
      if (this.monthShown.getUTCMonth() < 9) {
        month += "0";
      }
      month += `${this.monthShown.getUTCMonth() + 1}-01`;
      formData.append("start", month);
      this.myFiles.forEach(file => {
        formData.append("file", file);
      });

      this.dialogService.showSpinner();
      this.ingestService.fileIngest(formData).subscribe({
        next: (data: IngestResponse) => {
          this.dialogService.closeSpinner();
          if (data && data !== null) {
            const iSite = this.siteService.getSite();
            if (iSite) {
              const site = new Site(iSite);
              data.employees.forEach(emp => {
                if (site.employees) {
                  let found = false;
                  for (let e = 0; e < site.employees.length && !found; e++) {
                    if (site.employees[e].id === emp.id) {
                      found = true;
                      site.employees[e] = new Employee(emp);
                    }
                  }
                  if (!found) {
                    site.employees.push(new Employee(emp));
                  }
                  site.employees.sort((a,b) => a.compareTo(b));
                } else {
                  site.employees = [];
                  site.employees.push(new Employee(emp));
                }
              });
              this.siteService.setSite(site);
              this.updateTeam(site);
              this.site = new Site(site);
            } 
          }
          this.ingestForm.controls["file"].setValue('');
          this.myFiles = [];
        },
        error: (err: IngestResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      });
    }
  }

  updateTeam(site: Site) {
    const iTeam = this.teamService.getTeam();
    if (iTeam) {
      const team = new Team(iTeam);
      let found = false;
      for (let s=0; s < team.sites.length && !found; s++) {
        if (team.sites[s].id === site.id) {
          team.sites[s] = new Site(site);
          found = true;
        }
      }
      this.teamService.setTeam(team);
    }
  }

  onManualChange(change: IngestManualChange) {
    const numRe = new RegExp("^[0-9]{1,2}(\.[0-9])?$");
    if (this.site.employees) {
      this.site.employees.forEach(emp => {
        if (emp.id === change.employeeid) {
          if (change.changevalue === '' || change.changevalue === '0') {
            // this will delete work or leave as necessary
            // check for work on date.
            if (emp.work && emp.work.length > 0) {
              for (let i=emp.work.length -1; i >= 0; i--) {
                if (emp.work[i].dateWorked.getUTCFullYear() === change.changedate.getUTCFullYear()
                  && emp.work[i].dateWorked.getUTCMonth() === change.changedate.getUTCMonth()
                  && emp.work[i].dateWorked.getUTCDate() === change.changedate.getUTCDate()) {
                  const wk = new Work(emp.work[i]);
                  this.changes.push(new IngestChange(emp.id, "delete-work",
                    wk, undefined));
                  emp.work.splice(i, 1);
                }
              }
            }
            // check for leave on date.
            if (emp.leaves && emp.leaves.length > 0) {
              for (let i=emp.leaves.length - 1; i >= 0; i--) {
                if (emp.leaves[i].leavedate.getUTCFullYear() === change.changedate.getUTCFullYear()
                && emp.leaves[i].leavedate.getUTCMonth() === change.changedate.getUTCMonth()
                && emp.leaves[i].leavedate.getUTCDate() === change.changedate.getUTCDate()) {
                  const lv = new LeaveDay(emp.leaves[i]);
                  this.changes.push(new IngestChange(emp.id, "delete-leave", 
                    undefined, lv));
                  emp.leaves.splice(i, 1);
                }
              }
            }
          } else if (numRe.test(change.changevalue)) {
            // check for work already present on this date
            let found = false;
            if (emp.work && emp.work.length > 0) {
              emp.work.forEach(wk => {
                if (wk.dateWorked.getUTCFullYear() === change.changedate.getUTCFullYear()
                  && wk.dateWorked.getUTCMonth() === change.changedate.getUTCMonth()
                  && wk.dateWorked.getUTCDate() === change.changedate.getUTCDate()
                  && !found) {
                  wk.hours = Number(change.changevalue);
                  this.changes.push(
                    new IngestChange(emp.id, "update-work", wk, undefined)
                  );
                  found = true;
                }
              });
            }
            // if not found, add a work record
            if (!found) {
              // determine labor code to use.  If no labor codes are found for
              // date, the labor code will be workcenter for charge number and
              // year for the extension
              const iSite = this.siteService.getSite();
              let chgNo = '';
              let ext = '';
              if (iSite) {
                const site = new Site(iSite);
                emp.assignments.forEach(asgmt => {
                  asgmt.laborcodes.forEach(lc => {
                    if (site.forecasts && site.forecasts.length > 0) {
                      site.forecasts.forEach(f => {
                        if (f.isActive(change.changedate) && chgNo === ''
                          && ext === '') {
                          if (f.laborCodes && f.laborCodes.length > 0) {
                            f.laborCodes.forEach(fc => {
                              if (lc.chargeNumber === fc.chargeNumber
                                && lc.extension == fc.extension) {
                                chgNo = lc.chargeNumber;
                                ext = lc.extension;
                              }
                            });
                          }
                        }
                      });
                    }
                  });
                });
              }
              if (chgNo === '' || ext === '') {
                const wd = emp.getWorkdayWOLeaves(emp.site, change.changedate);
                chgNo = wd.workcenter;
                ext = `${change.changedate.getUTCFullYear()}`;
              }
              if (!emp.work) {
                emp.work = [];
              }
              const wk = new Work();
              wk.chargeNumber = chgNo;
              wk.extension = ext;
              wk.dateWorked = new Date(change.changedate);
              wk.payCode = 1;
              wk.hours = Number(change.changevalue);
              emp.work.push(wk);
              this.changes.push(new IngestChange(emp.id, "add-work", wk, undefined));
            }
          } else {
            // check for leave on this date.  if so mark as actual
            let found = false;
            if (emp.leaves && emp.leaves.length > 0) {
              emp.leaves.forEach(lv => {
                if (lv.leavedate.getUTCFullYear() === change.changedate.getUTCFullYear()
                && lv.leavedate.getUTCMonth() === change.changedate.getUTCMonth()
                && lv.leavedate.getUTCDate() === change.changedate.getUTCDate()
                && !found) {
                  found = true
                  lv.code = change.changevalue;
                  lv.status = "ACTUAL";
                  this.changes.push(new IngestChange(emp.id, "update-leave",
                    undefined, new LeaveDay(lv)));
                }
              });
            }
            // if not found, add leave to list and mark as actual
            if (!found) {
              const std = emp.getStandardWorkday(emp.site, change.changedate);
              const lv = new LeaveDay();
              lv.code = change.changevalue;
              lv.leavedate = new Date(change.changedate);
              lv.hours = std;
              lv.status = "ACTUAL";
              emp.leaves.push(lv);
              this.changes.push(new IngestChange(emp.id, "add-leave",
                undefined, lv));
            }
          } 
        }
      });
    }
  }

  approveChanges() {
    // update changes to database
    const iEmp = this.empService.getEmployee();
    if (iEmp) {
      const emp = new Employee(iEmp);
      this.authService.statusMessage = "Sending manual timecard updates";
      this.dialogService.showSpinner();
      this.ingestService.manualIngest(this.team.id, this.site.id, 
        emp.companyinfo.company, this.changes).subscribe({
        next: (data: IngestResponse) => {
          this.dialogService.closeSpinner();
          if (data && data !== null && data.employees) {
            this.authService.statusMessage = "Ingest complete";
            const iSite = this.siteService.getSite();
            if (iSite) {
              const site = new Site(iSite);
              if (!site.employees) {
                site.employees = [];
              }
              data.employees.forEach(tEmp => {
                if (site.employees) {
                  let found = false;
                  for (let e=0; e < site.employees.length && !found; e++) {
                    if (site.employees[e].id === tEmp.id) {
                      found = true;
                      site.employees[e] = new Employee(tEmp);
                    }
                  }
                  if (!found) {
                    site.employees.push(new Employee(tEmp));
                  }
                }
              });
              this.siteService.setSite(site);
              this.updateTeam(site);
              this.site = new Site(site);
              this.changes = [];
            } 
          }
          this.ingestForm.controls["file"].setValue('');
          this.myFiles = [];
        },
        error: (err: IngestResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      });
    }
  }

  clearChanges() {
    this.changes = [];
    this.site = new Site(this.site);
  }
}
