import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DeletionConfirmationComponent } from 'src/app/generic/deletion-confirmation/deletion-confirmation.component';
import { Employee, IEmployee } from 'src/app/models/employees/employee';
import { Site } from 'src/app/models/sites/site';
import { EmployeeResponse, Message } from 'src/app/models/web/employeeWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { SiteService } from 'src/app/services/site.service';
import { UserAccountDialogComponent } from '../site-employee-editor/user-account-dialog/user-account-dialog.component';

@Component({
  selector: 'app-site-employee-profile',
  templateUrl: './site-employee-profile.component.html',
  styleUrls: ['./site-employee-profile.component.scss']
})
export class SiteEmployeeProfileComponent {
  private _employee: Employee = new Employee();
  @Input()
  public set employee(iEmp: IEmployee) {
    this._employee = new Employee(iEmp);
    this.setEmployeePerms();
  }
  get employee(): Employee {
    return this._employee;
  }
  @Output() changed = new EventEmitter<Employee>();
  permForm: FormGroup;

  constructor(
    protected siteService: SiteService,
    protected empService: EmployeeService,
    protected authService: AuthService,
    protected dialogService: DialogService,
    private fb: FormBuilder,
    protected dialog: MatDialog
  ) {
    this.permForm = this.fb.group({
      employee: false,
      scheduler: false,
      company: false,
      siteleader: false,
      teamleader: false,
      admin: false,
    })

  }

  setEmployeePerms() {
    if (this.employee.user) {
      let answer = this.employee.user.isInGroup('scheduler', 'employee');
      this.permForm.controls['employee'].setValue(answer);
      answer = this.employee.user.isInGroup('scheduler', 'scheduler');
      this.permForm.controls['scheduler'].setValue(answer);
      answer = this.employee.user.isInGroup('scheduler', 'company');
      this.permForm.controls['company'].setValue(answer);
      answer = this.employee.user.isInGroup('scheduler', 'siteleader');
      this.permForm.controls['siteleader'].setValue(answer);
      answer = this.employee.user.isInGroup('scheduler', 'teamleader');
      this.permForm.controls['teamleader'].setValue(answer);
      answer = this.employee.user.isInGroup('scheduler', 'admin');
      this.permForm.controls['admin'].setValue(answer);
    } else {
      this.permForm.controls['employee'].setValue(false);
      this.permForm.controls['scheduler'].setValue(false);
      this.permForm.controls['company'].setValue(false);
      this.permForm.controls['siteleader'].setValue(false);
      this.permForm.controls['teamleader'].setValue(false);
      this.permForm.controls['admin'].setValue(false);
    }
  }

  employeeChanged(emp: Employee) {
    this.changed.emit(emp);
  }

  addUserAccount(): void {
    const dialogRef = this.dialog.open(UserAccountDialogComponent, {
      data: {emailAddress: '', password: ''},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.data) {
        if (result.emailAddress !== '') {
          this.dialogService.showSpinner();
          this.authService.statusMessage = "Adding User Account"
          this.empService.addUserAccount(this.employee.id, 
          result.emailAddress, result.password).subscribe({
            next: (data: EmployeeResponse) => {
              this.dialogService.closeSpinner();
              if (data && data !== null) {
                if (data.employee) {
                  this.employee = new Employee(data.employee);
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
    })
  }

  updatePermission(element: string) {
    let field = '';
    if (this.permForm.controls[element].value) {
      field = 'addperm';
    } else {
      field = 'removeperm';
    }
    this.dialogService.showSpinner();
    this.authService.statusMessage = "Adjusting Permissions";
    this.empService.updateEmployee(this.employee.id, field, element)
      .subscribe({
        next: (data: EmployeeResponse) => {
          this.dialogService.closeSpinner();
          if (data && data !== null) {
            if (data.employee) {
              this.employee = new Employee(data.employee);
            }
            const emp = this.empService.getEmployee();
            if (data.employee && emp && emp.id === data.employee.id) {
              this.empService.setEmployee(data.employee);
            }
            const site = this.siteService.getSite();
            if (site && site.employees && site.employees.length && data.employee) {
              let found = false;
              for (let i=0; i < site.employees.length && !found; i++) {
                if (site.employees[i].id === data.employee.id) {
                  site.employees[i] = new Employee(data.employee);
                  found = true;
                }
              }
              if (!found) {
                site.employees.push(new Employee(data.employee));
              }
              site.employees.sort((a,b) => a.compareTo(b));
              this.siteService.setSite(site);
              this.siteService.setSelectedEmployee(data.employee);
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

  unlockUser() {
    this.dialogService.showSpinner();
    this.authService.statusMessage = "Unlocking Account";
    this.empService.updateEmployee(this.employee.id, 'unlock', '0')
      .subscribe({
        next: (data: EmployeeResponse) => {
          this.dialogService.closeSpinner();
          if (data && data !== null) {
            if (data.employee) {
              this.employee = new Employee(data.employee);
            }
            const emp = this.empService.getEmployee();
            if (data.employee && emp && emp.id === data.employee.id) {
              this.empService.setEmployee(data.employee);
            }
            const site = this.siteService.getSite();
            if (site && site.employees && site.employees.length && data.employee) {
              let found = false;
              for (let i=0; i < site.employees.length && !found; i++) {
                if (site.employees[i].id === data.employee.id) {
                  site.employees[i] = new Employee(data.employee);
                  found = true;
                }
              }
              if (!found) {
                site.employees.push(new Employee(data.employee));
              }
              site.employees.sort((a,b) => a.compareTo(b));
              this.siteService.setSite(site);
              this.siteService.setSelectedEmployee(data.employee);
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

  deleteEmployee() {
    const dialogRef = this.dialog.open(DeletionConfirmationComponent, {
      width: '350px',
      data: {title: 'Confirm Employee Deletion', 
      message: 'Are you sure you want to delete this employee?'},
    });

    dialogRef.afterClosed().subscribe(result => { 
      if (result === 'yes') {
        this.empService.deleteEmployee(this.employee.id)
          .subscribe({
            next: (data: Message) => {
              this.dialogService.closeSpinner();
              if (data?.message === 'employee deleted') {
                this.siteService.setSelectedEmployee(new Employee());
                const site = this.siteService.getSite();
                if (site && site.employees) {
                  let found = false;
                  for (let i=0; i < site.employees.length && !found; i++) {
                    if (site.employees[i].id === this.employee.id) {
                      found = true;
                      site.employees.splice(i, 1);
                    }
                  }
                  this.siteService.setSite(new Site(site));
                }
              }
              this.changed.emit(new Employee());
            },
            error: (err: Message) => {
              this.dialogService.closeSpinner();
              this.authService.statusMessage = err.message;
            }
          });
      }
    });
  }
}
