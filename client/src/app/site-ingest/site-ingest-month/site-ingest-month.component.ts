import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DeletionConfirmationComponent } from 'src/app/generic/deletion-confirmation/deletion-confirmation.component';
import { Employee, IEmployee } from 'src/app/models/employees/employee';
import { Site } from 'src/app/models/sites/site';
import { Workcode } from 'src/app/models/teams/workcode';
import { IngestManualChange } from 'src/app/models/web/internalWeb';
import { IngestResponse } from 'src/app/models/web/siteWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { SiteIngestService } from 'src/app/services/site-ingest.service';
import { SiteService } from 'src/app/services/site.service';

@Component({
  selector: 'app-site-ingest-month',
  templateUrl: './site-ingest-month.component.html',
  styleUrls: ['./site-ingest-month.component.scss']
})
export class SiteIngestMonthComponent {
  private _employees: Employee[] = [];
  @Input()
  public set employees(emps: IEmployee[]) {
    this._employees = [];
    emps.forEach(emp => {
      this._employees.push(new Employee(emp));
    });
    this.changeMonth('set');
  }
  get employees(): Employee[] {
    return this._employees;
  }
  @Input() leavecodes: Workcode[] = [];
  @Input() ingestType: string = 'manual';
  @Output() changed = new EventEmitter<IngestManualChange>();
  @Output() monthChanged = new EventEmitter<Date>();
  month: Date;
  dateLabel: string = '';
  showList: Employee[] = [];
  showApprove: boolean = false;
  
  dates: Date[] = [];

  constructor(
    protected authService: AuthService,
    protected dialogService: DialogService,
    protected siteService: SiteService,
    protected ingestService: SiteIngestService,
    protected dialog: MatDialog
  ) {
    const now = new Date();
    this.month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
    this.monthChanged.emit(this.month);
    this.changeMonth('set');
  }

  changeMonth(direction: string) {
    let workFound = false;
    let teamid = "";
    let siteid = "";
    let company = "";
    if (this.showApprove) {
      const dialogRef = this.dialog.open(DeletionConfirmationComponent, {
        data: {title: 'Uncommitted Timecard Changes', 
        message: 'There are changes to the timecard data that has NOT '
          + "been submitted/approved. Approve Now?"},
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result === 'yes') {
          this.showApprove = false;
          this.changed.emit(new IngestManualChange('', this.month, 
            'approved'));
        
          const months: string[] = [ "January", "February", "March", "April", "May",
            "June", "July", "August", "September", "October", "November", "December"];
          if (direction.toLowerCase() === 'down') {
            this.month = new Date(Date.UTC(this.month.getUTCFullYear(), 
              this.month.getUTCMonth() - 1, 1))
          } else if (direction.toLowerCase() === 'up') {
            this.month = new Date(Date.UTC(this.month.getUTCFullYear(), 
              this.month.getUTCMonth() + 1, 1))
          }
          this.monthChanged.emit(this.month);
    
          this.dateLabel = `${months[this.month.getMonth()]} ${this.month.getFullYear()}`;
          this.showList = [];
          this.employees.forEach(emp => {
            if (emp.activeOnDate(this.month)) {
              const tEmp = new Employee(emp);
              teamid = tEmp.team;
              siteid = tEmp.site;
              company = tEmp.companyinfo.company;
              if (tEmp.work) {
                tEmp.work.forEach(wk => {
                  if (wk.dateWorked.getUTCFullYear() === this.month.getUTCFullYear()) {
                    workFound = true;
                  }
                });
              }
              this.showList.push(tEmp);
            }
          });
          this.setDates();
        }
      });
    } else {
      const months: string[] = [ "January", "February", "March", "April", "May",
        "June", "July", "August", "September", "October", "November", "December"];
      if (direction.toLowerCase() === 'down') {
        this.month = new Date(Date.UTC(this.month.getUTCFullYear(), 
          this.month.getUTCMonth() - 1, 1))
      } else if (direction.toLowerCase() === 'up') {
        this.month = new Date(Date.UTC(this.month.getUTCFullYear(), 
          this.month.getUTCMonth() + 1, 1))
      }
      this.monthChanged.emit(this.month);

      this.dateLabel = `${months[this.month.getUTCMonth()]} ${this.month.getUTCFullYear()}`;
      this.showList = [];
      this.employees.forEach(emp => {
        if (emp.activeOnDate(this.month)) {
          const tEmp = new Employee(emp);
          teamid = tEmp.team;
          siteid = tEmp.site;
          company = tEmp.companyinfo.company;
          if (tEmp.work) {
            tEmp.work.forEach(wk => {
              if (wk.dateWorked.getUTCFullYear() === this.month.getUTCFullYear()) {
                workFound = true;
              }
            });
          }
          this.showList.push(new Employee(emp));
        }
      });
      this.setDates();
    }
    if (!workFound) {
      this.authService.statusMessage = "Pulling Work for Month";
      this.dialogService.showSpinner();
      this.ingestService.getIngestEmployees(teamid, siteid, company, 
        this.month.getUTCFullYear()).subscribe({
          next: (data: IngestResponse) => {
            this.dialogService.closeSpinner();
            if (data && data !== null) {
              this.authService.statusMessage = "Retrieval complete";
              this.ingestType = data.ingest;
              let site: Site | undefined = undefined;
              const iSite = this.siteService.getSite();
              if (iSite) {
                site = new Site(iSite);
              } 
              data.employees.forEach(tEmp => {
                const emp = new Employee(tEmp);
                let eFound = false;
                this.employees.forEach(eEmp => {
                  if (eEmp.id === emp.id) {
                    eFound = true;
                    if (emp.work) {
                      emp.work.forEach(eWk => {
                        let wkFound = false;
                        if (eEmp.work) {
                          eEmp.work.forEach(wk => {
                            if (wk.dateWorked.getTime() === eWk.dateWorked.getTime()
                              && wk.chargeNumber === eWk.chargeNumber
                              && wk.extension === eWk.extension
                              && wk.payCode === eWk.payCode) {
                              wkFound = true;
                              if (eWk.hours !== wk.hours) {
                                wk.hours = eWk.hours;
                              }
                            }
                          });
                        }
                        if (!wkFound) {
                          if (!eEmp.work) {
                            eEmp.work = [];
                          }
                          eEmp.work.push(eWk)
                        }
                      });
                    }
                  }
                });
                if (!eFound) {
                  this.employees.push(new Employee(emp));
                }
                if (site && site.employees) {
                  let siteFound = false;
                  site.employees.forEach(eEmp => {
                    if (eEmp.id === emp.id) {
                      siteFound = true;
                      if (emp.work) {
                        emp.work.forEach(eWk => {
                          let wkFound = false;
                          if (eEmp.work) {
                            eEmp.work.forEach(wk => {
                              if (wk.dateWorked.getTime() === eWk.dateWorked.getTime()
                                && wk.chargeNumber === eWk.chargeNumber
                                && wk.extension === eWk.extension
                                && wk.payCode === eWk.payCode) {
                                wkFound = true;
                                if (eWk.hours !== wk.hours) {
                                  wk.hours = eWk.hours;
                                }
                              }
                            });
                          }
                          if (!wkFound) {
                            if (!eEmp.work) {
                              eEmp.work = [];
                            }
                            eEmp.work.push(eWk)
                          }
                        });
                      }
                    }
                  });
                  if (!siteFound) {
                    site.employees.push(new Employee(emp));
                  }
                }
              });
              if (site) {
                this.siteService.setSite(site);
              }
              this.showList = [];
              this.employees.forEach(tEmp => {
                if (tEmp.activeOnDate(this.month)) {
                  this.showList.push(new Employee(tEmp));
                }
              })
            }
          },
          error: (err: IngestResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = err.exception;
          }
        });
    }
  }

  setDates() {
    this.dates = [];
    let start = new Date(Date.UTC(this.month.getUTCFullYear(), 
      this.month.getUTCMonth(), 1))
    while (start.getUTCMonth() === this.month.getUTCMonth()) {
      this.dates.push(start);
      start = new Date(start.getTime() + (24 * 3600000));
    }
  }

  getMonthWidthStyle(): string {
    let totalwidth = (this.dates.length * 37) + 202 + 102;
    let monthWidth = totalwidth - 204;
    return `width: ${monthWidth}px;`;
  }

  onChange(change: IngestManualChange) {
    this.showApprove = true;
    this.changed.emit(change);
  }

  onApprove() {
    this.showApprove = false;
    this.changed.emit(new IngestManualChange('', this.month, 'approved'));
  }
}
