import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Employee, IEmployee } from 'src/app/models/employees/employee';
import { AnnualLeave, IAnnualLeave } from 'src/app/models/employees/leave';
import { EmployeeResponse } from 'src/app/models/web/employeeWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { SiteService } from 'src/app/services/site.service';

@Component({
  selector: 'app-site-employee-leave-balance-year',
  templateUrl: './site-employee-leave-balance-year.component.html',
  styleUrls: ['./site-employee-leave-balance-year.component.scss']
})
export class SiteEmployeeLeaveBalanceYearComponent {
  private _employee: Employee = new Employee();
  private _annual: AnnualLeave = new AnnualLeave();
  @Input()
  public set employee(iEmp: IEmployee) {
    this._employee = new Employee(iEmp);
  }
  get employee(): Employee {
    return this._employee;
  }
  @Input()
  public set annualLeave(iAnnual: IAnnualLeave) {
    this._annual = new AnnualLeave(iAnnual);
    this.setAnnualLeave();
  }
  get annualLeave(): AnnualLeave {
    return this._annual;
  }
  @Output() changed = new EventEmitter<Employee>();
  balanceForm: FormGroup

  constructor(
    protected authService: AuthService,
    protected empService: EmployeeService,
    protected siteService: SiteService,
    protected dialogService: DialogService,
    private fb: FormBuilder
  ) {
    this.balanceForm = this.fb.group({
      annual: ['0.0', [Validators.required]],
      carryover: ['0.0', [Validators.required]],
    })
  }

  setAnnualLeave() {
    this.balanceForm.controls['annual']
      .setValue(this.annualLeave.annual.toFixed(1));
    this.balanceForm.controls['carryover']
      .setValue(this.annualLeave.carryover.toFixed(1));
  }

  updateBalance(field: string) {
    let value = `0.0`;
    let valid = false;
    const floatRE = new RegExp('^[0-9]{1,3}\.[0-9]$');
    switch (field.toLowerCase()) {
      case "annual":
        value = this.balanceForm.value.annual;
        valid = floatRE.test(value);
        break;
      case "carryover":
        value = this.balanceForm.value.carryover;
        valid = floatRE.test(value);
        break;
    }
    if (valid) {
      this.dialogService.showSpinner();
      this.authService.statusMessage = "Updating Leave Balance";
      this.empService.updateLeaveBalance(this.employee.id, this.annualLeave.year,
      field, value).subscribe({
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

    } else {
      this.dialogService.closeSpinner();
      this.authService.statusMessage = `Error: ${field} value must be in `
        + 'decimal number format!';
    }
  }

  getClass(field: string): string {
    let answer = 'amounts ';
    if (field.toLowerCase() === 'year') {
      answer = `${field} `;
    }
    if (this.annualLeave.year % 2 === 0) {
      return answer + "even";
    } 
    return answer + "odd";
  }
}

