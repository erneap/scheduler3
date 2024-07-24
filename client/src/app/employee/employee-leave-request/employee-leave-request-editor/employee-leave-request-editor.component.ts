import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Employee } from 'src/app/models/employees/employee';
import { ILeaveRequest, LeaveRequest } from 'src/app/models/employees/leave';
import { Team } from 'src/app/models/teams/team';
import { Workcode } from 'src/app/models/teams/workcode';
import { AppStateService } from 'src/app/services/app-state.service';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';
import { EmployeeLeaveRequestEditorUnapproveComponent } from './employee-leave-request-editor-unapprove/employee-leave-request-editor-unapprove.component';
import { EmployeeResponse } from 'src/app/models/web/employeeWeb';
import { EmployeeLeaveRequestEditorMidDenialComponent } from './employee-leave-request-editor-mid-denial/employee-leave-request-editor-mid-denial.component';
import { DeletionConfirmationComponent } from 'src/app/generic/deletion-confirmation/deletion-confirmation.component';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

@Component({
  selector: 'app-employee-leave-request-editor',
  templateUrl: './employee-leave-request-editor.component.html',
  styleUrls: ['./employee-leave-request-editor.component.scss'],
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
export class EmployeeLeaveRequestEditorComponent {
  private _request: LeaveRequest = new LeaveRequest();
  @Input() 
  public set request(req: ILeaveRequest | undefined) {
    this._request = new LeaveRequest(req);
    this.setCurrent();
  }
  get request(): LeaveRequest {
    return this._request;
  }
  @Input() approver: boolean = false;
  private _width: number = 700;
  @Input()
  public set width(w: number) {
    this._width = w;
    if (this._width > 700) this._width = 700;
  }
  get width(): number {
    return this._width;
  }
  private _height: number = 800;
  @Input()
  public set height(h: number) {
    this._height = h;
  }
  get height(): number {
    return this._height;
  }
  @Input() employee: Employee = new Employee();
  @Output() changed = new EventEmitter<Employee>();

  leavecodes: Workcode[] = [];
  editorForm: FormGroup;
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
    protected appState: AppStateService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.leavecodes = [];
    const iteam = this.teamService.getTeam();
    if (iteam) {
      const team = new Team(iteam);
      team.workcodes.forEach(wc => {
        if (wc.isLeave) {
          this.leavecodes.push(new Workcode(wc))
        }
      });
    }
    this.leavecodes.sort((a,b) => a.compareTo(b));
    this.editorForm = this.fb.group({
      start: ["", [Validators.required]],
      end: ["", [Validators.required]],
      primarycode: ['', [Validators.required]],
      comment: '',
    });
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
      this.editorForm.controls['comment'].setValue('');
      this.editorForm.controls['comment'].enable();
      
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
      this.editorForm.controls['comment'].setValue('');
      this.editorForm.controls['comment'].disable();
    }
  }

  inputStyle(element: string): string {
    let ratio = this.width / 700;
    if (ratio > 1.0) ratio = 1.0;
    let width = 700;
    let fontSize = ratio;
    switch (element.toLowerCase()) {
      case "comment":
        width = Math.floor(400 * ratio);
        break;
      case "buttons":
        width = Math.floor(50 * ratio);
        break;
      case "button":
        return `font-size: ${ratio * 1.6}rem;`;
      default:
        width = Math.floor(200 * ratio);
        break;
    }
    return `width: ${width}px;font-size: ${ratio}rem;`;
  }

  commentsStyle(): string {
    let ratio = this.width / 700;
    if (ratio > 1.0) ratio = 1.0;
    const width = Math.floor(700 * ratio);
    const fontSize = 0.9 * ratio;
    let height = Math.floor(20 * ratio) * this.request.comments.length;
    const availHeight = this.height - (this.viewHeight() + 200);
    if (height > availHeight) {
      height = availHeight - 10;
    }
    return `width: ${width}px;height: ${height}px;font-size: ${fontSize}rem;`;
  }

  datetimeString(dt: Date): string {
    let answer = '';
    if (dt.getUTCMonth() < 9) {
      answer += '0';
    }
    answer += `${dt.getUTCMonth() + 1}/`;
    if (dt.getUTCDate() < 10) {
      answer += '0';
    }
    answer += `${dt.getUTCDate()}/${dt.getUTCFullYear()} `;
    if (dt.getHours() < 10) {
      answer += '0';
    }
    answer += `${dt.getHours()}:`;
    if (dt.getMinutes() < 10) {
      answer += '0';
    }
    answer += `${dt.getMinutes()}Z`;
    return answer;
  }

  processChange(field: string) {
    if (this.employee && this.request && this.request.id !== '') {
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
        case "comment":
          value = this.editorForm.value.comment;
          break;
      }
      if (conflict > this.maxMids) {
        const dialogRef = this.dialog.open(
          EmployeeLeaveRequestEditorMidDenialComponent, {
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
              this.dialogService.closeSpinner();
              if (data && data !== null) {
                if (data.employee) {
                  this.employee = new Employee(data.employee);
                  this.employee.requests.forEach(req => {
                    if (this.request && this.request.id === req.id) {
                      this.request = new LeaveRequest(req)
                    }
                  });
                }
              }
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

  deleteRequest() {
    const dialogRef = this.dialog.open(DeletionConfirmationComponent, {
      width: '250px',
      data: {
        title: 'Confirm Leave Request Deletion',
        message: 'Are you sure you want to delete this leave request?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.toLowerCase() === 'yes' && this.request) {
        this.dialogService.showSpinner();
        const reqid = this.request.id;
        this.clearRequest();
        if (reqid) {
          this.request = undefined;
          this.empService.deleteLeaveRequest(this.employee.id, reqid)
          .subscribe({
            next: (data: EmployeeResponse) => {
              this.dialogService.closeSpinner();
              if (data && data !== null) {
                if (data.employee) {
                  this.employee = new Employee(data.employee);
                  this.employee.requests.forEach(req => {
                    if (this.request && this.request.id === req.id) {
                      this.request = new LeaveRequest(req)
                    }
                  });
                }
                this.setCurrent();
              }
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

  getCurrentLeaveRequestDate(): string {
    if (this.request) {
      return `${this.request.requestDate.getUTCMonth() + 1}/`
        + `${this.request.requestDate.getUTCDate()}/`
        + `${this.request.requestDate.getUTCFullYear()}`;
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
      return `${this.request.approvalDate.getUTCMonth() + 1}/`
        + `${this.request.approvalDate.getUTCDate()}/`
        + `${this.request.approvalDate.getUTCFullYear()}`;
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
        const dialogRef = this.dialog.open(
          EmployeeLeaveRequestEditorMidDenialComponent, {
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
                this.employee = new Employee(data.employee);
                if (this.employee.requests) {
                  this.employee.requests.forEach(req => {
                    if (req.startdate.getUTCFullYear() === start.getUTCFullYear()
                      && req.startdate.getUTCMonth() === start.getUTCMonth()
                      && req.startdate.getUTCDate() === start.getUTCDate()
                      && req.enddate.getUTCFullYear() === end.getUTCFullYear()
                      && req.enddate.getUTCMonth() === end.getUTCMonth()
                      && req.enddate.getUTCDate() === end.getUTCDate()) {
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
              this.employee = new Employee(data.employee);
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
    const dialogRef = this.dialog.open(
      EmployeeLeaveRequestEditorUnapproveComponent, {
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
                  this.employee = new Employee(data.employee);
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
              this.employee = new Employee(data.employee);
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

  viewHeight(): number {
    let answer = this.height - 350;
    let days = Math.floor((this.request.enddate.getTime() 
      - this.request.startdate.getTime()) / (24 * 3600000)) + 1;
    let ratio = this.width / 700;
    let weeks = Math.ceil(days / 7);
    if (ratio > 1.0) ratio = 1.0;
    const cellWidth = Math.floor(100 * ratio);
    const calendarHeight = ((cellWidth + 2) * weeks);
    if (calendarHeight < answer) {
      answer = calendarHeight;
    }
    return answer;
  }

  onDayChange(chg: string) {
    if (chg !== '' && this.request && this.request.id !== '') {
      this.empService.updateLeaveRequest(this.employee.id, 
        this.request.id, 'day', chg).subscribe({
        next: (data: EmployeeResponse) => {
          this.dialogService.closeSpinner();
          if (data && data !== null) {
            if (data.employee) {
              this.employee = new Employee(data.employee);
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
}
