import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Employee, IEmployee } from 'src/app/models/employees/employee';
import { ContactType } from 'src/app/models/teams/contacttype';
import { EmployeeResponse } from 'src/app/models/web/employeeWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { SiteService } from 'src/app/services/site.service';

@Component({
  selector: 'app-employee-contact-info-item',
  templateUrl: './employee-contact-info-item.component.html',
  styleUrls: ['./employee-contact-info-item.component.scss']
})
export class EmployeeContactInfoItemComponent {
  private _contactType: ContactType | undefined;
  @Input()
  public set contacttype(ct: ContactType) {
    this._contactType = new ContactType(ct);
  }
  get contacttype(): ContactType {
    if (!this._contactType) {
      return new ContactType();
    }
    return this._contactType;
  }
  private _employee: Employee = new Employee();
  @Input()
  public set employee(emp: IEmployee) {
    this._employee = new Employee(emp);
    this.setContactType();
  }
  get employee(): Employee {
    return this._employee;
  }
  @Input() width: number = 650;
  @Output() changed = new EventEmitter<Employee>();
  contactid: number = 0;
  form: FormGroup;

  constructor(
    protected empService: EmployeeService,
    protected siteService: SiteService,
    protected dialogService: DialogService,
    protected authService: AuthService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      itemValue: ['', [Validators.required]],
    })
  }

  contactStyle(): string {
    let cWidth = this.width / 2;
    const ratio = this.width / 650;
    return `width: ${cWidth}px;font-size: ${ratio * 1.2}em;`
  }

  setContactType() {
    this.form.controls["itemValue"].setValue('');
    this.employee.contactinfo.forEach(c => {
      if (c.typeid === this.contacttype.id) {
        this.contactid = c.id;
        this.form.controls["itemValue"].setValue(c.value);
      }
    });
  }

  updateContactType() {
    let value = this.form.value.itemValue;
    this.dialogService.showSpinner();
    console.log(value);
    
    this.empService.updateEmployeeContact(this.employee.id, 
    this.contacttype.id, this.contactid, value).subscribe({
      next: (resp: EmployeeResponse) => {
        this.dialogService.closeSpinner();
        if (resp.employee) {
          this.employee = resp.employee;
          const iEmp = this.empService.getEmployee();
          if (iEmp && iEmp.id === this.employee.id) {
            this.empService.setEmployee(resp.employee);
          }
          this.changed.emit(new Employee(resp.employee));
        }
      },
      error: (err: EmployeeResponse) => {
        this.dialogService.closeSpinner();
        this.authService.statusMessage = 
          `Error Updating Contact Info: ${err.exception}`;
      }
    });
  }
}
