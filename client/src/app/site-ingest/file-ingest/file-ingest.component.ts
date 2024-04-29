import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Employee } from 'src/app/models/employees/employee';
import { LeaveDay } from 'src/app/models/employees/leave';
import { Work } from 'src/app/models/employees/work';
import { Site } from 'src/app/models/sites/site';
import { Company } from 'src/app/models/teams/company';
import { Team } from 'src/app/models/teams/team';
import { Workcode } from 'src/app/models/teams/workcode';
import { IngestManualChange } from 'src/app/models/web/internalWeb';
import { IngestChange, IngestResponse } from 'src/app/models/web/siteWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { SiteIngestService } from 'src/app/services/site-ingest.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-file-ingest',
  templateUrl: './file-ingest.component.html',
  styleUrls: ['./file-ingest.component.scss']
})
export class FileIngestComponent {
  ingestForm: FormGroup;
  companyForm: FormGroup;
  employees: Employee[] = [];
  ingestType: string = 'manual';
  leavecodes: Workcode[] = [];
  myFiles: File[] = [];
  showApprove: boolean = false;
  manualUpdateList: IngestChange[] = [];
  companies: Company[] = [];
  company: string = "";
  monthShown: Date = new Date();

  constructor(
    protected authService: AuthService,
    protected dialogService: DialogService,
    protected empService: EmployeeService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected ingestService: SiteIngestService,
    private fb: FormBuilder
  ) {
    const tEmp = this.empService.getEmployee()
    if (tEmp) {
      this.company = tEmp.companyinfo.company;
    }
    this.ingestForm = this.fb.group({
      file: ['', [Validators.required]],
    });
    this.companyForm = this.fb.group({
      company: this.company,
    });
    this.getEmployees();

    const iTeam = this.teamService.getTeam();
    if (iTeam) {
      this.companies = [];
      iTeam.companies.forEach(co => {
        this.companies.push(new Company(co));
      });
    }
  }

  onChangeCompany() {
    this.company = this.companyForm.value.company;
    this.getEmployees();
  }

  onMonthChanged(newMonth: Date) {
    this.monthShown = new Date(newMonth);
  }

  getEmployees() {
    this.leavecodes = [];
    this.employees = [];
    const iTeam = this.teamService.getTeam();
    if (iTeam) {
      const team = new Team(iTeam);
      team.workcodes.forEach(wc => {
        if (wc.isLeave) {
          this.leavecodes.push(new Workcode(wc))
        }
      });
      this.leavecodes.sort((a,b) => a.compareTo(b))
    }
    let siteid = "";
    const iSite = this.siteService.getSite();
    if (iSite) {
      const site = new Site(iSite);
      siteid = site.id;
      if (site.employees) {
        site.employees.forEach(tEmp => {
          if (tEmp.companyinfo.company === this.company) {
            this.employees.push(new Employee(tEmp));
          }
        });
      }
    }
    let teamid = "";
    if (iTeam) {
      teamid = iTeam.id;
      this.ingestType = 'manual';
      iTeam.companies.forEach(co => {
        if (co.id === this.company) {
          this.ingestType = co.ingest;
        }
      })
    }
    if (this.employees.length <= 0) {
      const now = new Date();
      this.authService.statusMessage = "Retrieving site's employees and ingest type";
      this.dialogService.showSpinner();
      this.ingestService.getIngestEmployees(teamid, siteid, 
        this.company, now.getFullYear()).subscribe({
        next: (data: IngestResponse) => {
          this.dialogService.closeSpinner();
          if (data && data !== null) {
            this.authService.statusMessage = "Retrieval complete";
            this.ingestType = data.ingest;
            this.employees = [];
            const iSite = this.siteService.getSite();
            if (iSite) {
              const site = new Site(iSite);
              if (!site.employees) {
                site.employees = [];
              }
              data.employees.forEach(tEmp => {
                this.employees.push(new Employee(tEmp));
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
            } else {
              data.employees.forEach(tEmp => {
                this.employees.push(new Employee(tEmp));
              });
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
      formData.append("company", this.company);
      let month = `${this.monthShown.getFullYear()}-`;
      if (this.monthShown.getMonth() < 9) {
        month += "0";
      }
      month += `${this.monthShown.getMonth() + 1}-01`;
      formData.append("start", month);
      this.myFiles.forEach(file => {
        formData.append("file", file);
      });

      this.authService.statusMessage = "Ingesting Timecard Information";
      this.dialogService.showSpinner();
      this.ingestService.fileIngest(formData).subscribe({
        next: (data: IngestResponse) => {
          this.dialogService.closeSpinner();
          if (data && data !== null) {
            this.authService.statusMessage = "Ingest complete";
            this.employees = [];
            const iSite = this.siteService.getSite();
            if (iSite) {
              const site = new Site(iSite);
              if (!site.employees) {
                site.employees = [];
              }
              data.employees.forEach(tEmp => {
                this.employees.push(new Employee(tEmp));
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
            } else {
              data.employees.forEach(tEmp => {
                this.employees.push(new Employee(tEmp));
              });
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

  onChange(change: IngestManualChange) {
    if (change.changevalue === 'empty') {
      this.manualUpdateList = [];
    } else if (change.changevalue !== 'approved') {
      // update the employee list with the changed value
      // check to see if the value is a number, if so, its work
      // if not a number, it is leave with hours equals to standard workday
      const numRe = new RegExp("^[0-9]{1,2}(\.[0-9])?$");
      this.employees.forEach(emp => {
        if (emp.id === change.employeeid) {
          if (change.changevalue === '' || change.changevalue === '0') {
            // this will delete work or leave as necessary
            // check for work on date.
            if (emp.work && emp.work.length > 0) {
              for (let i=emp.work.length -1; i >= 0; i--) {
                if (emp.work[i].dateWorked.getFullYear() === change.changedate.getFullYear()
                  && emp.work[i].dateWorked.getMonth() === change.changedate.getMonth()
                  && emp.work[i].dateWorked.getDate() === change.changedate.getDate()) {
                  const wk = new Work(emp.work[i]);
                  this.manualUpdateList.push(new IngestChange(emp.id, "delete-work",
                    wk, undefined));
                  emp.work.splice(i, 1);
                }
              }
            }
            // check for leave on date.
            if (emp.leaves && emp.leaves.length > 0) {
              for (let i=emp.leaves.length - 1; i >= 0; i--) {
                if (emp.leaves[i].leavedate.getFullYear() === change.changedate.getFullYear()
                && emp.leaves[i].leavedate.getMonth() === change.changedate.getMonth()
                && emp.leaves[i].leavedate.getDate() === change.changedate.getDate()) {
                  const lv = new LeaveDay(emp.leaves[i]);
                  this.manualUpdateList.push(new IngestChange(emp.id, "delete-leave", 
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
                if (wk.dateWorked.getFullYear() === change.changedate.getFullYear()
                  && wk.dateWorked.getMonth() === change.changedate.getMonth()
                  && wk.dateWorked.getDate() === change.changedate.getDate()
                  && !found) {
                  wk.hours = Number(change.changevalue);
                  this.manualUpdateList.push(
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
                ext = `${change.changedate.getFullYear()}`;
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
              this.manualUpdateList.push(new IngestChange(emp.id, "add-work", wk, undefined));
            }
          } else {
            // check for leave on this date.  if so mark as actual
            let found = false;
            if (emp.leaves && emp.leaves.length > 0) {
              emp.leaves.forEach(lv => {
                if (lv.leavedate.getFullYear() === change.changedate.getFullYear()
                && lv.leavedate.getMonth() === change.changedate.getMonth()
                && lv.leavedate.getDate() === change.changedate.getDate()
                && !found) {
                  found = true
                  lv.code = change.changevalue;
                  lv.status = "ACTUAL";
                  this.manualUpdateList.push(new IngestChange(emp.id, "update-leave",
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
              this.manualUpdateList.push(new IngestChange(emp.id, "add-leave",
                undefined, lv));
            }
          } 
        }
      });
    } else {
      // update changes to database
      const iEmp = this.empService.getEmployee();
      if (iEmp) {
        const emp = new Employee(iEmp);
        this.authService.statusMessage = "Sending manual timecard updates";
        this.dialogService.showSpinner();
        this.ingestService.manualIngest(emp.team, emp.site, 
          emp.companyinfo.company, this.manualUpdateList).subscribe({
          next: (data: IngestResponse) => {
            this.dialogService.closeSpinner();
            if (data && data !== null) {
              this.authService.statusMessage = "Ingest complete";
              this.employees = [];
              const iSite = this.siteService.getSite();
              if (iSite) {
                const site = new Site(iSite);
                if (!site.employees) {
                  site.employees = [];
                }
                data.employees.forEach(tEmp => {
                  this.employees.push(new Employee(tEmp));
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
              } else {
                data.employees.forEach(tEmp => {
                  this.employees.push(new Employee(tEmp));
                });
              }
            }
            this.ingestForm.controls["file"].setValue('');
            this.myFiles = [];
          },
          error: (err: IngestResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = err.exception;
          }
        })
      }
    }
  }
}
