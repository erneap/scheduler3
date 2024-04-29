import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Employee, IEmployee } from 'src/app/models/employees/employee';
import { ILeaveRequest, LeaveRequest } from 'src/app/models/employees/leave';
import { Workcode } from 'src/app/models/teams/workcode';
import { EmployeeResponse } from 'src/app/models/web/employeeWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';
import { DeleteLeaveRequestDialogComponent } from '../delete-leave-request-dialog/delete-leave-request-dialog.component';
import { MessageService } from 'src/app/services/message.service';
import { LeaveUnapproveDialogComponent } from './leave-unapprove-dialog/leave-unapprove-dialog.component';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { LeaveRequestMidDenialDialogComponent } from '../leave-request-mid-denial-dialog/leave-request-mid-denial-dialog.component';
import { AppStateService } from 'src/app/services/app-state.service';

@Component({
  selector: 'app-leave-request-editor',
  templateUrl: './leave-request-editor.component.html',
  styleUrls: ['./leave-request-editor.component.scss'],
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
export class LeaveRequestEditorComponent {
  private _employee: Employee = new Employee();
  private _request?: LeaveRequest;
  private _approver: boolean = false;
  @Input()
  public set employee(emp: IEmployee) {
    this._employee = new Employee(emp);
  }
  get employee(): Employee {
    return this._employee;
  }
  @Input()
  public set request(iReq: ILeaveRequest | undefined) {
    if (iReq) {
      this._request = new LeaveRequest(iReq);
    } else {
      this._request = undefined;
    }
    this.setCurrent();
  }
  get request(): LeaveRequest | undefined {
    return this._request;
  }
  @Input()
  public set approver(show: boolean) {
    this._approver = show;
  }
  get approver(): boolean {
    return this._approver;
  }
  @Input() width: number = 740;
  @Output() changed = new EventEmitter<Employee>();
  editorForm: FormGroup;
  leaveList: Workcode[];
  draft: boolean = false;
  ptohours: number = 0;
  holidayhours: number = 0;
  maxMids: number = 0;

  constructor(
    protected authService: AuthService,
    protected empService: EmployeeService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected dialogService: DialogService,
    protected msgService: MessageService,
    protected appState: AppStateService,
    private fb: FormBuilder,
    protected dialog: MatDialog
  ) { 
    this.editorForm = this.fb.group({
      start: ["", [Validators.required]],
      end: ["", [Validators.required]],
      primarycode: ['', [Validators.required]],
    });
    this.leaveList = [];
    const team = this.teamService.getTeam();
    if (team) {
      team.workcodes.forEach(wc => {
        if (wc.isLeave) {
          this.leaveList.push(new Workcode(wc));
        }
      });
      this.leaveList.sort((a,b) => a.compareTo(b));
    }
    this.setCurrent();
    const tEmp = this.authService.getUser();
    if (tEmp) {
      if (this.employee.id !== tEmp.id 
        && (this.authService.hasRole('scheduler')
        || this.authService.hasRole('siteleader'))) {
        this.approver = true;
      }
    }
  }

  setCurrent() {
    this.ptohours = 0.0;
    this.holidayhours = 0.0;
    this.approver = false;
    if (this.request) {
      this.editorForm.controls['start'].setValue(this.request.startdate);
      this.editorForm.controls['end'].setValue(this.request.enddate);
      this.editorForm.controls['primarycode'].setValue(this.request.primarycode);
      this.editorForm.controls['start'].enable();
      this.editorForm.controls['end'].enable();
      this.editorForm.controls['primarycode'].enable();
      
      this.draft = (this.request.status.toLowerCase() === 'draft')
      const tEmp = this.authService.getUser();
      if (tEmp) {
        if (this.request.id !== '' && this.employee.id !== tEmp.id 
          && this.request.status.toLowerCase() === "requested"
          && this.request.approvedby === ''
          && (this.authService.hasRole('scheduler')
          || this.authService.hasRole('siteleader'))) {
          this.approver = true;
        }
      }
      this.request.requesteddays.forEach(day => {
        if (day.code.toLowerCase() === 'v') {
          this.ptohours += day.hours;
        } else if (day.code.toLowerCase() === 'h') {
          this.holidayhours += day.hours;
        }
      });
    } else {
      this.editorForm.controls['start'].setValue("");
      this.editorForm.controls['end'].setValue("");
      this.editorForm.controls['primarycode'].setValue("");
      this.editorForm.controls['start'].disable();
      this.editorForm.controls['end'].disable();
      this.editorForm.controls['primarycode'].disable();
    }
  }

  getDateString(date: Date): string {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  }

  getLeaveCodes(): Workcode[] {
    let answer: Workcode[] = [];
    const team = this.teamService.getTeam();
    if (team) {
      team.workcodes.forEach(wc => {
        if (wc.isLeave) {
          answer.push(new Workcode(wc));
        }
      })
    }
    answer.sort((a,b) => a.compareTo(b));
    return answer;
  }

  getCurrentLeaveRequestDate(): string {
    if (this.request) {
      return `${this.request.requestDate.getMonth() + 1}/`
        + `${this.request.requestDate.getDate()}/`
        + `${this.request.requestDate.getFullYear()}`;
    }
    return 'NEW';
  }

  getApprovedBy(): string {
    if (this.request && this.request.approvedby !== '') {
      let answer = '';
      const site = this.siteService.getSite();
      if (site && site.employees && site.employees.length > 0) {
        site.employees.forEach(emp => {
          if (this.request && emp.id === this.request.approvedby) {
            answer = emp.name.getFullName();
          }
        });
      }
      return answer;
    }
    return '-';
  }

  getApprovedDate(): string {
    if (this.request && this.request.approvedby !== '') {
      return `${this.request.approvalDate.getMonth() + 1}/`
        + `${this.request.approvalDate.getDate()}/`
        + `${this.request.approvalDate.getFullYear()}`;
    }
    return '-';
  }

  processNewRequest() {
    if (this.editorForm.valid && this.employee) {
      const maxMids = 0;
      let start = new Date(this.editorForm.value.start);
      let end = new Date(this.editorForm.value.end);
      const code = this.editorForm.value.primarycode;
      // check for mid-shift rotation conflict
      const conflict = this.checkForMidShift(start, end);
      if (conflict > this.maxMids) {
        const dialogRef = this.dialog.open(LeaveRequestMidDenialDialogComponent, {
          width: '250px',
          height: '150px'
        });
      } else {
        this.dialogService.showSpinner();
        this.authService.statusMessage = "Processing leave request";
        this.empService.addNewLeaveRequest(this.employee.id, start, end, code)
        .subscribe({
          next: (data: EmployeeResponse) => {
            this.dialogService.closeSpinner();
            if (data && data !== null) {
              if (data.employee) {
                this.employee = data.employee;
                if (this.employee.requests) {
                  this.employee.requests.forEach(req => {
                    if (req.startdate.getFullYear() === start.getFullYear()
                      && req.startdate.getMonth() === start.getMonth()
                      && req.startdate.getDate() === start.getDate()
                      && req.enddate.getFullYear() === end.getFullYear()
                      && req.enddate.getMonth() === end.getMonth()
                      && req.enddate.getDate() === end.getDate()) {
                        this.request = new LeaveRequest(req);
                      }
                  });
                }
                const iEmp = this.empService.getEmployee();
                if (iEmp && iEmp.id === this.employee.id) {
                  this.empService.setEmployee(data.employee);
                }
              }
              this.setCurrent();
              const site = this.siteService.getSite()
            }
            this.authService.statusMessage = "Leave Request processing complete";
            this.changed.emit(new Employee(this.employee));
          },
          error: (err: EmployeeResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = err.exception;
          }
        });
      }
    }
  }

  checkForMidShift(startDate: Date, endDate: Date): number {
    let answer = 0;
    const site = this.siteService.getSite();
    console.log(site);
    if (site && !site.showMids) {
      const now = new Date();
      if (!this.employee) {
        const tEmp = this.empService.getEmployee();
        if (tEmp) {
          this.employee = tEmp;
        }
      }
      let start:Date = new Date(startDate);
      while (start.getTime() <= endDate.getTime()) {
        const wd = this.employee.getWorkday(site.id, start, now);
        if (wd.code.toLowerCase() === 'm') {
          answer++;
        }
        start = new Date(start.getTime() + (24 * 3600000));
      }
    }
    return answer;
  }

  processChange(field: string) {
    if (this._employee && this.request && this.request.id !== '') {
      let value = '';
      let conflict: number = 0;
      const start = this.editorForm.value.start;
      let dStart: Date = new Date(0);
      if (start) {
        dStart = new Date(start);
      }
      const end = this.editorForm.value.end;
      let dEnd: Date = new Date(0);
      if (end) {
        dEnd = new Date(end);
      }
      switch (field.toLowerCase()) {
        case "start":
          if (start) {
            value = `${dStart.getUTCFullYear()}-`
              + `${(dStart.getUTCMonth() < 9) ? '0' : ''}${dStart.getUTCMonth() + 1}-`
              + `${(dStart.getUTCDate() < 10) ? '0' : ''}${dStart.getUTCDate()}`;
          }
          if (dEnd.getTime() < dStart.getTime()) {
            dEnd = new Date(dStart);
          }
          conflict = this.checkForMidShift(dStart, dEnd);
          break;
        case "end":
          const end = this.editorForm.value.end;
          if (end) {
            value = `${dEnd.getUTCFullYear()}-`
              + `${(dEnd.getUTCMonth() < 9)? '0' : ''}${dEnd.getUTCMonth() + 1}-`
              + `${(dEnd.getUTCDate() < 10) ? '0' : ''}${dEnd.getUTCDate()}`;
          }
          conflict = this.checkForMidShift(dStart, dEnd);
          break;
        case "code":
          value = this.editorForm.value.primarycode;
          break;
      }
      if (conflict > this.maxMids) {
        const dialogRef = this.dialog.open(LeaveRequestMidDenialDialogComponent, {
          width: '400px',
          height: '200px'
        });
      } else {
        this.dialogService.showSpinner();
        if (value !== '') {
          this.empService.updateLeaveRequest(this.employee.id, 
            this.request.id, field, value)
          .subscribe({
            next: (data: EmployeeResponse) => {
              this.authService.statusMessage = "Updating Leave Request "
                + "Primary Code change";
              this.dialogService.closeSpinner();
              if (data && data !== null) {
                if (data.employee) {
                  this.employee = data.employee;
                  this.employee.requests.forEach(req => {
                    if (this.request && this.request.id === req.id) {
                      this.request = new LeaveRequest(req)
                    }
                  });
                  const iEmp = this.empService.getEmployee();
                  if (iEmp && iEmp.id === this.employee.id) {
                    this.empService.setEmployee(data.employee);
                  }
                }
                this.setCurrent();
              }
              this.authService.statusMessage = "Update complete";
              this.changed.emit(new Employee(this.employee));
            },
            error: (err: EmployeeResponse) => {
              this.dialogService.closeSpinner();
              this.authService.statusMessage = err.exception;
            }
          });
        }
      }
    } else if (this.request && this.request.id === '' 
      && field.toLowerCase() === 'start') {
      const start = this.editorForm.value.start;
      if (start) {
        this.editorForm.controls['end'].setValue(new Date(start));
      }
    }
  }

  processDayChange(value: string) {
    if (value !== '' && this.request && this.request.id !== '') {
      this.authService.statusMessage = "Updating Leave Request Date change";
      this.empService.updateLeaveRequest(this.employee.id, 
        this.request.id, 'day', value)
        .subscribe({
          next: (data: EmployeeResponse) => {
            this.dialogService.closeSpinner();
            if (data && data !== null) {
              if (data.employee) {
                this.employee = data.employee;
                this.employee.requests.forEach(req => {
                  if (this.request && this.request.id === req.id) {
                    this.request = new LeaveRequest(req)
                  }
                });
                
              }
              this.setCurrent();
            }
            this.authService.statusMessage = "Update complete";
            this.changed.emit(new Employee(this.employee));
          },
          error: (err: EmployeeResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = err.exception;
          }
        });
    }
  }

  deleteRequest() {
    const dialogRef = this.dialog.open(DeleteLeaveRequestDialogComponent, {
      width: '250px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.toLowerCase() === 'yes' && this.request) {
        this.dialogService.showSpinner();
        const reqid = this.request.id;
        this.clearRequest();
        if (reqid) {
          this.request = undefined;
          this.authService.statusMessage = "Deleting Leave Request";
          this.empService.deleteLeaveRequest(this.employee.id, reqid)
            .subscribe({
              next: (data: EmployeeResponse) => {
                this.dialogService.closeSpinner();
                if (data && data !== null) {
                  if (data.employee) {
                    this.employee = data.employee;
                    this.employee.requests.forEach(req => {
                      if (this.request && this.request.id === req.id) {
                        this.request = new LeaveRequest(req)
                      }
                    });
                  }
                  this.setCurrent();
                }
                this.authService.statusMessage = "Deletion Complete";
                this.changed.emit(new Employee(this.employee));
              },
              error: (err: EmployeeResponse) => {
                this.dialogService.closeSpinner();
                this.authService.statusMessage = err.exception;
              }
            });
        }
      }
    });
  }

  clearRequest() {
    this.request = undefined;
    this.setCurrent();
  }

  approveLeaveRequest() {
    this.authService.statusMessage = "Approving Leave Request";
    this.dialogService.showSpinner();
    const iEmp = this.empService.getEmployee();
    if (iEmp && this.request) {
      this.empService.updateLeaveRequest(this.employee.id, this.request.id, 
      "approve", iEmp.id).subscribe({
        next: (data: EmployeeResponse) => {
          this.dialogService.closeSpinner();
          if (data && data !== null) {
            if (data.employee) {
              this.employee = data.employee;
              this.employee.requests.forEach(req => {
                if (this.request && this.request.id === req.id) {
                  this.request = new LeaveRequest(req)
                }
              });
            }
            this.setCurrent();
          }
          this.authService.statusMessage = "Approval Complete";
          this.changed.emit(new Employee(this.employee));
        },
        error: (err: EmployeeResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      });
    }
  }

  unapproveLeaveRequest() {
    const dialogRef = this.dialog.open(LeaveUnapproveDialogComponent, {
      width: '300px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== '') {
        this.authService.statusMessage = "Un-Approving Leave Request";
        this.dialogService.showSpinner();
        const iEmp = this.empService.getEmployee();
        if (iEmp && this.request) {
          this.empService.updateLeaveRequest(this.employee.id, this.request.id, 
            "unapprove", result).subscribe({
            next: (data: EmployeeResponse) => {
              this.dialogService.closeSpinner();
              if (data && data !== null) {
                if (data.employee) {
                  this.employee = data.employee;
                  this.employee.requests.forEach(req => {
                    if (this.request && this.request.id === req.id) {
                      this.request = new LeaveRequest(req)
                    }
                  });
                }
                this.setCurrent();
              }
              this.authService.statusMessage = "Un-Approval Complete";
              this.changed.emit(new Employee(this.employee));
            },
            error: (err: EmployeeResponse) => {
              this.dialogService.closeSpinner();
              this.authService.statusMessage = err.exception;
            }
          });
        }
      }
    });
  }

  submitForApproval() {
    this.authService.statusMessage = "Submitting for approval";
    this.dialogService.showSpinner();
    const iEmp = this.empService.getEmployee();
    if (iEmp && this.request) {
      this.empService.updateLeaveRequest(this.employee.id, this.request.id, 
      "requested", iEmp.id).subscribe({
        next: (data: EmployeeResponse) => {
          this.dialogService.closeSpinner();
          if (data && data !== null) {
            if (data.employee) {
              this.employee = data.employee;
              this.employee.requests.forEach(req => {
                if (this.request && this.request.id === req.id) {
                  this.request = new LeaveRequest(req)
                }
              });
            }
            this.setCurrent();
          }
          this.authService.statusMessage = "Submit for Approval Complete";
          this.changed.emit(new Employee(this.employee));
        },
        error: (err: EmployeeResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      });
    }

  }

  commentsWidth(): string {
    const width = (this.appState.viewWidth < 500) 
      ? (this.appState.viewWidth - 44) : 500;
    return `width: ${width}px;padding-bottom: 10px;`;
  }
}
