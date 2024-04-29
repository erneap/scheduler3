import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DeletionConfirmationComponent } from 'src/app/generic/deletion-confirmation/deletion-confirmation.component';
import { transformErrorString } from 'src/app/models/employees/common';
import { Employee, IEmployee } from 'src/app/models/employees/employee';
import { MustMatchValidator } from 'src/app/models/validators/must-match-validator.directive';
import { PasswordStrengthValidator } from 'src/app/models/validators/password-strength-validator.directive';
import { AuthenticationResponse, EmployeeResponse, Message } from 'src/app/models/web/employeeWeb';
import { AppStateService } from 'src/app/services/app-state.service';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { SiteService } from 'src/app/services/site.service';

@Component({
  selector: 'app-employee-profile-form',
  templateUrl: './employee-profile-form.component.html',
  styleUrls: ['./employee-profile-form.component.scss']
})
export class EmployeeProfileFormComponent {
  private _employee: Employee | undefined;
  @Input()
  public set employee(iEmp: IEmployee) {
    this._employee = new Employee(iEmp);
    this.setForm();
  }
  get employee(): Employee {
    if (!this._employee) {
      const iEmp = this.empService.getEmployee();
      if (iEmp) {
        return new Employee(iEmp);
      }
      return new Employee();
    }
    return this._employee;
  }
  @Input() width: number = 800;
  @Output() changed = new EventEmitter<Employee>();

  profileForm: FormGroup;
  emailForm: FormGroup;
  formError: string = '';
  showPassword: boolean = true;
  selectedEmail: string = '';

  constructor(
    protected authService: AuthService,
    protected empService: EmployeeService,
    protected siteService: SiteService,
    protected dialogService: DialogService,
    protected stateService: AppStateService,
    private httpClient: HttpClient,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.profileForm = fb.group({
      email: ['', [Validators.required, Validators.email]],
      first: ['', [Validators.required]],
      middle: '',
      last: ['', [Validators.required]],
      password: ['', [new PasswordStrengthValidator()]],
      password2: ['', [new MustMatchValidator()]],
    });
    this.emailForm = fb.group({
      editor: ['', [Validators.email]],
    })

    this.width = this.stateService.viewWidth;
    if (this.width > 800) {
      this.width = 800;
    }
    this.setForm();
  }

  setForm() {
    if (this.employee.user) {
      this.showPassword = true;
      this.profileForm.controls["email"].setValue(this.employee.user.emailAddress);
    } else {
      this.showPassword = false;
      this.profileForm.controls["email"].setValue('');
    }
    this.profileForm.controls["first"].setValue(this.employee.name.first);
    this.profileForm.controls["middle"].setValue(this.employee.name.middle);
    this.profileForm.controls["last"].setValue(this.employee.name.last);
    this.profileForm.controls["password"].setValue('');
    this.profileForm.controls["password2"].setValue('');
  }

  viewClass(): string {
    let answer = "flexlayout center chart flexgap ";
    if (this.width < 450) {
      answer += "column";
    } else {
      answer += "row";
    }
    return answer;
  }

  itemClass(): string {
    let answer = "flexlayout center row";
    if (this.stateService.isMobile() || this.stateService.isTablet()) {
      if (this.width < 450) {
        answer += "column";
      } else {
        answer += "row";
      }
    } else {
      if (this.width < 870) {
        answer += "column";
      } else {
        answer += "row";
      }
    }
    return answer;
  }

  nameStyle(): string {
    if (this.width >= 460) {
      return 'width: 150px;font-size: 12pt;';
    } 
    const ratio = this.width / 460;
    let cWidth = Math.floor(150 * ratio);
    let cFont = Math.floor(12 * ratio);
    if (cWidth <= 100) {
      cWidth = 100;
      cFont = 9;
    }
    return `width: ${cWidth}px;font-size: ${cFont}pt;`;
  }

  passwdStyle(): string {
    if (this.width >= 460) {
      return 'width: 175px;font-size: 12pt;';
    } 
    const ratio = this.width / 460;
    let cWidth = Math.floor(175 * ratio);
    let cFont = Math.floor(12 * ratio);
    if (cWidth <= 150) {
      cWidth = 150;
      cFont = 9;
    }
    return `width: ${cWidth}px;font-size: ${cFont}pt;`;
  }

  getPasswordError(): string {
    let answer: string = ''
    if (this.profileForm.get('password')?.hasError('required')) {
      answer = "Required";
    }
    if (this.profileForm.get('password')?.hasError('passwordStrength')) {
      if (answer !== '') {
        answer += ', ';
      }
      answer += "Minimum(s)";
    }
    return answer;
  }

  getVerifyError(): string {
    let answer: string = ''
    if (this.profileForm.get('password2')?.hasError('required')) {
      answer = "Required";
    }
    if (this.profileForm.get('password2')?.hasError('matching')) {
      if (answer !== '') {
        answer += ', ';
      }
      answer += "Doesn't match";
    }
    return answer;
  }

  setPassword() {
    if (this.profileForm.valid) {
      let id = "";
      if (this.employee && this.employee.id !== "") {
        id = this.employee.id;
      } else {
        const user = this.authService.getUser();
        id = (user && user.id) ? user.id : '';
      }
    
      const passwd = this.profileForm.value.password;
      this.dialogService.showSpinner();
      this.authService.statusMessage = "Updating User Password";
      this.authService.changePassword(id, passwd)
        .subscribe({
          next: (data: EmployeeResponse) => {
            this.dialogService.closeSpinner();
            if (data && data !== null) {
              this.formError = data.exception;
              if (data.exception === '') {
                this.profileForm.controls['password'].setValue(undefined);
                this.profileForm.controls['password2'].setValue(undefined);
              }
              if (data.employee && data.employee !== null) {
                const iEmp = this.empService.getEmployee();
                if (iEmp && iEmp.id === data.employee.id) {
                  this.empService.setEmployee(new Employee(data.employee));
                }
                const site = this.siteService.getSite();
                if (site && site.employees && site.employees.length && data.employee) {
                  let found = false;
                  for (let i=0; i < site.employees.length && !found; i++) {
                    if (site.employees[i].id === data.employee.id) {
                      site.employees[i] = new Employee(data.employee);
                    }
                  }
                }
                this.changed.emit(new Employee(data.employee));
              }
            }
            this.authService.statusMessage = "Update complete";
          },
          error: (error: EmployeeResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = error.exception;
          }
        });
    }
  }

  updateUserField(field: string) {
    let value: string = '';
    let id = "";
    if (this.employee && this.employee.id !== "") {
      id = this.employee.id;
    } else {
      const user = this.authService.getUser();
      id = (user && user.id) ? user.id : '';
    }
    switch(field.toLowerCase()) {
      case "email":
        value = this.profileForm.value.email;
        break;
      case "first":
        value = this.profileForm.value.first;
        break;
      case "middle":
        value = this.profileForm.value.middle;
        break;
      case "last":
        value = this.profileForm.value.last;
        break;
    }
    this.dialogService.showSpinner();
    this.authService.statusMessage = `Updating User's ${field.toUpperCase()}`;
    this.empService.updateEmployee(id, field, value)
      .subscribe({
        next: (data: EmployeeResponse) => {
          this.dialogService.closeSpinner();
          if (data && data !== null) {
            if (data.employee) {
              this.employee = data.employee;
              const emp = this.empService.getEmployee();
              if (emp && emp.id === data.employee.id) {
                this.empService.setEmployee(data.employee);
              }
              const site = this.siteService.getSite();
              if (site && site.employees && site.employees.length && data.employee) {
                let found = false;
                for (let i=0; i < site.employees.length && !found; i++) {
                  if (site.employees[i].id === data.employee.id) {
                    site.employees[i] = new Employee(data.employee);
                  }
                }
              }
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

  setEmailClass(email: string): string {
    let answer = 'item';
    if (email.toLowerCase() === this.selectedEmail.toLowerCase()) {
      answer += " selected";
    }
    return answer;
  }

  selectEmail(email: string) {
    if (email !== 'new') {
      this.selectedEmail = email;
      this.emailForm.controls['editor'].setValue(email);
    } else {
      this.selectedEmail = '';
      this.emailForm.controls['editor'].setValue('');
    }
  }

  updateEmail() {
    this.dialogService.showSpinner();
    const newEmail = this.emailForm.value.editor;
    if (this.selectedEmail === '') {
      this.empService.updateEmployee(this.employee.id, "addemail", newEmail)
      .subscribe({
        next: (data: EmployeeResponse) => {
          this.dialogService.closeSpinner();
          if (data && data !== null) {
            if (data.employee) {
              this.employee = data.employee;
              this.empService.replaceEmployee(this.employee);
            }
          }
          this.changed.emit(new Employee(this.employee));
          this.emailForm.controls['editor'].setValue(newEmail);
          this.selectedEmail = newEmail;
          this.authService.statusMessage = "Update complete"; 
        },
        error: (err: EmployeeResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      });
    } else {
      this.empService.updateEmployeeEmail(this.employee.id, "updateemail", 
        this.selectedEmail, newEmail).subscribe({
        next: (data: EmployeeResponse) => {
          this.dialogService.closeSpinner();
          if (data && data !== null) {
            if (data.employee) {
              this.employee = data.employee;
              this.empService.replaceEmployee(this.employee);
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

  deleteEmail() {
    if (this.selectedEmail !== '') {
      const dialogRef = this.dialog.open(DeletionConfirmationComponent, {
        data: {title: 'Confirm Email Deletion',
        message:  "Are you sure you want to delete this employee's email address?"},
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === 'yes') {
          this.dialogService.showSpinner();
          this.empService.updateEmployee(this.employee.id, "removeemail", 
            this.selectedEmail).subscribe({
            next: (data: EmployeeResponse) => {
              this.dialogService.closeSpinner();
              if (data && data !== null) {
                if (data.employee) {
                  this.employee = data.employee;
                  this.empService.replaceEmployee(this.employee);
                }
              }
              this.changed.emit(new Employee(this.employee));
              this.emailForm.controls['editor'].setValue('');
              this.selectedEmail = '';
              this.authService.statusMessage = "Update complete"; 
            },
            error: (err: EmployeeResponse) => {
              this.dialogService.closeSpinner();
              this.authService.statusMessage = err.exception;
            }
          });
        }
      });
    }
  }
}
