import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Employee } from 'src/app/models/employees/employee';
import { ILeaveRequest, LeaveDay, LeaveRequest } from 'src/app/models/employees/leave';
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
import { CompanyHoliday } from 'src/app/models/teams/company';
import { NoticeDialogComponent } from 'src/app/generic/notice-dialog/notice-dialog.component';

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
  @Input() team: Team = new Team();
  @Output() changed = new EventEmitter<Employee>();

  leavecodes: Workcode[] = [];
  editorForm: FormGroup;
  draft: boolean = false;
  ptohours: number = 0;
  holidayhours: number = 0;
  maxMids: number = 0;
  alreadyChecked: boolean = false;

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
      this.team = new Team(iteam);
      this.team.workcodes.forEach(wc => {
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
    this.alreadyChecked = false;
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
        this.alreadyChecked = false;
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
    const iEmp = this.empService.getEmployee();
    if (iEmp && this.request) {
      if (!this.alreadyChecked) {
        if (!this.checkRequestForHolidayProblems()) {
          this.dialogService.showSpinner();
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
        } else {
          const dialogRef = this.dialog.open(NoticeDialogComponent, {
            data: {title: 'Holiday Policy Issue', 
            message: "You have more than 8 hours on a holiday or "
              + "you are requesting a holiday more than 14 days before "
              + "it's actual reference date.  You can request a waiver by "
              + "re-submitting the request without a change."},
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result === 'yes') {
              this.alreadyChecked = true;
            }
          });
        }
      } else {
        this.dialogService.showSpinner();
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
  }

  isEmployeeActive(holiday: CompanyHoliday, employee: Employee, dt: Date): boolean {
    employee.assignments.sort((a,b) => a.compareTo(b));
    const actual = holiday.getActual(dt.getFullYear());
    const startasgmt = employee.assignments[0];
    const endasgmt = employee.assignments[
      employee.assignments.length - 1];
    if (actual) {
      return (actual.getTime() >= startasgmt.startDate.getTime() &&
        actual.getTime() <= endasgmt.endDate.getTime());
    }
    return true;
  }

  checkRequestForHolidayProblems(): boolean {
    let problems = false;
    if (this.request && this.request.requesteddays.length > 0) {
      for (let i=0; i < this.request.requesteddays.length && !problems; i++) {
        if (this.request.requesteddays[i].code.toLowerCase() === "h") {
          problems = this.checkForHolidayAvailability(new Date(
            this.request.requesteddays[i].leavedate), 
            this.request.requesteddays[i].hours);
        }
      }
    }
    return problems;
  }

  checkForHolidayAvailability(dt: Date, hours: number): boolean {
    if (hours > 8.0) {
      return true;
    }
    var empHolidays: LeaveDay[] = [];
    var holidays: CompanyHoliday[] = [];
    
    // get any company holidays
    this.team.companies.forEach(co => {
      if (co.id.toLowerCase() === this.employee.companyinfo.company.toLowerCase()) {
        if (co.holidays.length > 0) {
          co.holidays.forEach(hol => {
            const holiday = new CompanyHoliday(hol);
            holiday.active = this.isEmployeeActive(holiday, this.employee, dt);
            holidays.push(holiday);
          });
        }
      }
    });
    this.employee.leaves.forEach(lv => {
      if (lv.leavedate.getUTCFullYear() === dt.getFullYear()
        && lv.code.toLowerCase() === 'h') {
        empHolidays.push(new LeaveDay(lv));
      }
    });
    empHolidays.sort((a,b) => a.compareTo(b))
    // loop through employee holiday and add leave for equal to ref dates first
    empHolidays.forEach(eHol => {
      holidays.forEach(hol => {
        hol.actualdates.forEach(ad => {
          if (ad.getUTCFullYear() === dt.getFullYear()) {
              const adStart = new Date(ad.getTime() - (7 * 24 * 3600000));
              const adEnd = new Date(ad.getTime() + (7 * 24 * 3600000));
            if (eHol.leavedate.getTime() > adStart.getTime()
              && eHol.leavedate.getTime() < adEnd.getTime()
              && hol.leaveDays.length === 0) {
              hol.addLeaveDay(eHol);
              eHol.used = true;
            }
          }
        });
      });
    });

    // then if floater is not filled, add first non-reference date to floater
    holidays.forEach(hol => {
      if (hol.id.toLowerCase() === "f" && hol.leaveDays.length === 0) {
        let found = false;
        for (let i=0; i < empHolidays.length && !found; i++) {
          if (!empHolidays[i].used) {
            hol.addLeaveDay(empHolidays[i]);
            empHolidays[i].used = true;
            found = true;
          }
        }
      }
    });

    // then loop again to fill in for non-reference dates
    empHolidays.forEach(eHol => {
      if (!eHol.used) {
        if (eHol.hours === 8.0) {
          let found = false;
          for (let i=0; i < holidays.length && !found; i++) {
            if (holidays[i].getLeaveDayTotalHours() === 0.0 
              && holidays[i].active) {
              found = true;
              holidays[i].addLeaveDay(eHol);
            }
          }
        } else if (eHol.hours < 8.0) {
          let found = false;
          for (let i=0; i < holidays.length && !found; i++) {
            if (holidays[i].getLeaveDayTotalHours() + eHol.hours <= 8.0 
              && holidays[i].active) {
              found = true;
              holidays[i].addLeaveDay(eHol);
            }
          }
        }
      }
    });

    // now check to see if the requested holiday is available on the date
    let found = true;
    for (let i=0; i < holidays.length && found; i++) {
      const hol = holidays[i];
      if (hol.id.toLowerCase() === "h") {
        let actual = hol.getActual(dt.getFullYear());
        if (actual) {
          actual = new Date(actual.getTime() - (14 * 24 * 3600000));
          if (actual.getTime() < dt.getTime() && hol.getLeaveDayTotalHours() + hours <= 8.0) {
            found = false;
          }
        }
      } else if (hol.getLeaveDayTotalHours() + hours <= 8.0) {
        found = false;
      }
    }
    return found;
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
      this.alreadyChecked = false;
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

  checkHoliday(chg: string): boolean {
    return false;
  }
}
