import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ListItem } from 'src/app/generic/button-list/listitem';
import { Employee, IEmployee } from 'src/app/models/employees/employee';
import { LeaveRequest } from 'src/app/models/employees/leave';
import { EmployeeResponse } from 'src/app/models/web/employeeWeb';
import { AppStateService } from 'src/app/services/app-state.service';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { EmployeeService } from 'src/app/services/employee.service';

@Component({
    selector: 'app-employee-leave-request',
    templateUrl: './employee-leave-request.component.html',
    styleUrls: ['./employee-leave-request.component.scss'],
    standalone: false
})
export class EmployeeLeaveRequestComponent {
  private _employee: Employee = new Employee();
  @Input()
  public set employee(emp: IEmployee) {
    this._employee = new Employee(emp);
    this.setRequests();
    if (this.selected) {
      let found = false;
      this._employee.requests.forEach(req => {
        if (this.selected && this.selected.id === req.id) {
          found = true;
          this.selected = new LeaveRequest(req);
        }
      });
      if (!found) {
        this.selected = undefined;
      }
    }
  }
  get employee(): Employee {
    return this._employee;
  }
  @Input() width: number = 700;
  @Input() height: number = 1000;
  @Output() changed = new EventEmitter<Employee>();

  selected: LeaveRequest | undefined;
  requests: ListItem[] = [];
  requestForm: FormGroup;

  constructor(
    protected authService: AuthService,
    protected empService: EmployeeService,
    protected appState: AppStateService,
    protected dialogService: DialogService,
    private fb: FormBuilder
  ) {
    this.requestForm = this.fb.group({
      request: '',
    });
    const iEmp = this.empService.getEmployee();
    if (iEmp) {
      this.employee = new Employee(iEmp);
    }
    this.width = this.appState.viewWidth;
    this.height = this.appState.viewHeight - 70;
  }

  setRequests() {
    this.requests = [];
    this.requests.push(new ListItem('new', 'Add New Request'));
    this.employee.requests.sort((a,b) => a.compareTo(b));
    let now = new Date();
    now = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    this.employee.requests.forEach(req => {
      if (req.enddate.getTime() >= now.getTime()) {
        const label = this.getUTCDateString(req.startdate) + " - "
          + this.getUTCDateString(req.enddate);
        this.requests.push(new ListItem(req.id, label));
      }
    });
  }

  showEditor(): boolean {
    return (this.selected !== undefined && this.selected.id !== 'new');
  }

  getUTCDateString(date: Date): string {
    return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
  }

  itemClass(id: string): string {
    if (this.selected) {
      if ((id === 'new' && (this.selected.id === '' 
          || this.selected.id === 'new')) || (id === this.selected.id)) { 
        return 'item selected';
      }
    }
    return 'item';
  }

  mobileListStyle(): string {
    let height = 20 * this.requests.length;
    if (height > 60) height = 60;
    return `height: ${height}px;`;
  }

  onSelect(id: string) {
    if (id === 'new' || id === '') {
      let now = new Date();
      now = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 
        0, 0, 0, 0))
      this.dialogService.showSpinner();
      this.empService.addNewLeaveRequest(this.employee.id, now, now, 'V')
      .subscribe({
        next: (data: EmployeeResponse) => {
          this.dialogService.closeSpinner();
          if (data && data !== null) {
            if (data.employee) {
              this.employee = data.employee;
              if (this.employee.requests) {
                this.employee.requests.forEach(req => {
                  if (req.startdate.getUTCFullYear() === now.getUTCFullYear() 
                    && req.startdate.getUTCMonth() === now.getUTCMonth()
                    && req.startdate.getUTCDate() === now.getUTCDate()
                    && req.primarycode === 'V') {
                    this.selected = new LeaveRequest(req);
                  }
                });
              }
            }
          }
          this.changed.emit(new Employee(this.employee));
        },
        error: (err: EmployeeResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      });
    } else {
      this.employee.requests.forEach(req => {
        if (req.id === id) {
          this.selected = new LeaveRequest(req);
        }
      });
    }
  }

  onSelectMobile() {
    const id = this.requestForm.value.request;
    if (id === 'new' || id === '') {
      let now = new Date();
      now = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 
        0, 0, 0, 0))
      this.dialogService.showSpinner();
      this.empService.addNewLeaveRequest(this.employee.id, now, now, 'V')
      .subscribe({
        next: (data: EmployeeResponse) => {
          this.dialogService.closeSpinner();
          if (data && data !== null) {
            if (data.employee) {
              this.employee = data.employee;
              if (this.employee.requests) {
                this.employee.requests.forEach(req => {
                  if (req.startdate.getUTCFullYear() === now.getUTCFullYear() 
                    && req.startdate.getUTCMonth() === now.getUTCMonth()
                    && req.startdate.getUTCDate() === now.getUTCDate()
                    && req.primarycode === 'V') {
                    this.selected = new LeaveRequest(req);
                  }
                });
              }
            }
          }
          this.changed.emit(new Employee(this.employee));
        },
        error: (err: EmployeeResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      });
    } else {
      this.employee.requests.forEach(req => {
        if (req.id === id) {
          this.selected = new LeaveRequest(req);
        }
      });
    }
  }

  onChange(emp: Employee) {
    const iEmp = this.empService.getEmployee();
    if (iEmp && iEmp.id === emp.id) {
      this.empService.setEmployee(emp);
    }
    this.employee = emp;
    this.changed.emit(emp);
  }
}
