import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Employee, IEmployee } from 'src/app/models/employees/employee';
import { LeaveDay } from 'src/app/models/employees/leave';
import { Site } from 'src/app/models/sites/site';
import { Workcode } from 'src/app/models/teams/workcode';
import { EmployeeResponse } from 'src/app/models/web/employeeWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-site-employee-leave',
  templateUrl: './site-employee-leave.component.html',
  styleUrls: ['./site-employee-leave.component.scss'],
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
export class SiteEmployeeLeaveComponent {
  private _employee: Employee = new Employee();
  @Input()
  public set employee(iEmp: IEmployee) {
    this._employee = new Employee(iEmp);
    this.setLeaves();
  }
  get employee(): Employee {
    return this._employee;
  }
  @Output() changed = new EventEmitter<Employee>();

  year: number;
  leaveDays: LeaveDay[];
  leaveCodes: Workcode[];
  leaveForm: FormGroup;
  site: Site | undefined;

  constructor(
    protected authService: AuthService,
    protected empService: EmployeeService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected dialogService: DialogService,
    private fb: FormBuilder
  ) { 
    this.year = (new Date()).getFullYear();
    this.leaveDays = [];
    this.leaveCodes = [];
    const team = this.teamService.getTeam();
    if (team) {
      team.workcodes.forEach(wc => {
        if (wc.isLeave) {
          this.leaveCodes.push(new Workcode(wc));
        }
      });
    }
    this.leaveCodes.sort((a,b) => a.compareTo(b));
    this.leaveForm = this.fb.group({
      date: ['', [Validators.required]],
      code: ['', [Validators.required]],
      hours: [0.0, [Validators.required, Validators.min(0.1), Validators.max(12.0)]],
      status: ['', [Validators.required]],
    });
    let tSite = this.siteService.getSite();
    if (tSite) {
      this.site = new Site(tSite);
    }
  }

  clearLeaveForm() {
    this.leaveForm.controls['date'].setValue('');
    this.leaveForm.controls['date'].setErrors(null);
    this.leaveForm.controls['code'].setValue('');
    this.leaveForm.controls['code'].setErrors(null);
    this.leaveForm.controls['hours'].setValue(0);
    this.leaveForm.controls['hours'].setErrors(null);
    this.leaveForm.controls['status'].setValue('');
    this.leaveForm.controls['status'].setErrors(null);
  }

  showAddButton(): boolean {
    const now = new Date();
    const lvDate = this.leaveForm.value.date;
    if (!lvDate) {
      return false;
    }
    const lvType = this.leaveForm.value.code;
    const lvHours = this.leaveForm.value.hours;
    const lvStatus = this.leaveForm.value.status;
    if (this.leaveForm.valid && lvType !== '' 
      && lvHours > 0 && lvHours <= 12.0 && lvStatus !== '') {
      return true;
    }
    return false;
  }

  showLeaveEditor(): boolean {
    const now = new Date();
    return (this.year >= now.getFullYear());
  }

  setLeaves() {
    this.leaveDays = [];
    let start = new Date(Date.UTC(this.year, 0, 1));
    let end = new Date(Date.UTC(this.year + 1, 0, 1));
    if (this.site && this.site.utcOffset) {
      start = new Date(Date.UTC(this.year, 0, 1, (this.site.utcOffset * -1), 
        0, 0));
      end = new Date(Date.UTC(this.year + 1, 0, 1, (this.site.utcOffset * -1), 
        0, 0));
    }
    this.employee.leaves.forEach(lv => {
      if (lv.leavedate.getTime() >= start.getTime() 
        && lv.leavedate.getTime() < end.getTime()) {
        this.leaveDays.push(new LeaveDay(lv));
      }
    });
    this.leaveDays.sort((a,b) => b.compareTo(a));
  }
  
  dateString(date: Date): string {
    let answer = '';
    if (date.getMonth() < 9) {
      answer += '0';
    }
    answer += `${date.getMonth() + 1}/`;
    if (date.getDate() < 10) {
      answer += '0';
    }
    answer += `${date.getDate()}/${date.getFullYear()}`;
    return answer;
  }

  updateYear(direction: string) {
    if (direction.substring(0,1).toLowerCase() === 'u') {
      this.year++;
    } else {
      this.year--;
    }
    this.setLeaves();
  }

  updateEmployee(emp: Employee) {
    this.employee = emp;
    this.changed.emit(new Employee(emp));
  }

  addLeave() {
    let error = '';
    const reHours = new RegExp("^\d{1,2}(.\d{1})?$");
    const tDate = this.leaveForm.value.date;
    var sDate: Date | undefined;
    if (tDate) {
      sDate = new Date(tDate);
    }
    let leave: LeaveDay = new LeaveDay();
    leave.id = 0;
    if (sDate instanceof Date) {
      leave.leavedate = new Date(Date.UTC(sDate.getFullYear(), 
      sDate.getMonth(), sDate.getDate()));
    } else {
      error += 'Leave Date incorrect format (MM/DD/YYYY)';
    }
    leave.code = this.leaveForm.value.code;
    const sHours = this.leaveForm.value.hours;
    if (sHours > 0.1 && sHours <= 12.0) {
      leave.hours = Number(sHours);
    } else {
      if (error !== '') {
        error += ", ";
      }
      error += "Leave Hours is not a number (Decimal hours)"
    }
    leave.status = this.leaveForm.value.status
    if (error !== '') {
      this.authService.statusMessage = 'ERROR: ' + error;
      return;
    }
    this.empService.addLeave(this.employee.id, leave)
      .subscribe({
        next: (data: EmployeeResponse) => {
          this.dialogService.closeSpinner();
          if (data && data !== null) {
            if (data.employee) {
              this.employee = new Employee(data.employee);
              this.employee.leaves.sort((a,b) => a.compareTo(b));
              this.setLeaves()
              this.clearLeaveForm();
            }
            const emp = this.empService.getEmployee();
            if (data.employee && emp && emp.id === data.employee.id) {
              this.empService.setEmployee(data.employee);
            }
          }
          this.changed.emit(new Employee(this.employee));
          this.authService.statusMessage = "Update complete";
        },
        error: (err: EmployeeResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      });
  }
}
