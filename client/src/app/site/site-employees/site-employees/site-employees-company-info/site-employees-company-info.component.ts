import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Employee, IEmployee } from 'src/app/models/employees/employee';
import { Company } from 'src/app/models/teams/company';
import { EmployeeResponse } from 'src/app/models/web/employeeWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-site-employees-company-info',
  templateUrl: './site-employees-company-info.component.html',
  styleUrls: ['./site-employees-company-info.component.scss']
})
export class SiteEmployeesCompanyInfoComponent {
  private _employee: Employee = new Employee();
  @Input()
  public set employee(iEmp: IEmployee) {
    this._employee = new Employee(iEmp);
    this.setEmployee();
  }
  get employee(): Employee {
    return this._employee;
  }
  @Input() width: number = 1048;
  @Output() changed = new EventEmitter<Employee>();
  compInfoForm: FormGroup;
  companies: Company[];

  constructor(
    protected authService: AuthService,
    protected empService: EmployeeService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected dialogService: DialogService,
    private fb: FormBuilder
  ) {
    this.compInfoForm = this.fb.group({
      company: ['', [Validators.required]],
      employeeid: ['', [Validators.required]],
      alternateid: '',
      jobtitle: ['', [Validators.required]],
      rank: '',
      costcenter: '',
      division: '',
    });

    const team = this.teamService.getTeam();
    this.companies = [];
    if (team) {
      team.companies.forEach(co => {
        this.companies.push(new Company(co));
      });
      this.companies.sort((a,b) => a.compareTo(b));
    }
  }

  setEmployee() {
    this.compInfoForm.controls['company'].setValue(
      this.employee.companyinfo.company);
    this.compInfoForm.controls['employeeid'].setValue(
      this.employee.companyinfo.employeeid);
    this.compInfoForm.controls['alternateid'].setValue(
      this.employee.companyinfo.alternateid);
    this.compInfoForm.controls['jobtitle'].setValue(
      this.employee.companyinfo.jobtitle);
    this.compInfoForm.controls['rank'].setValue(
      this.employee.companyinfo.rank);
    this.compInfoForm.controls['costcenter'].setValue(
      this.employee.companyinfo.costcenter);
    this.compInfoForm.controls['division'].setValue(
      this.employee.companyinfo.division);
  }

  updateCompanyInfo(field: string) {
    let value: string = '';
    switch (field.toLowerCase()) {
      case "company":
        value = this.compInfoForm.value.company;
        break;
      case "employeeid":
        value = this.compInfoForm.value.employeeid;
        break;
      case "alternateid":
        value = this.compInfoForm.value.alternateid;
        break;
      case "jobtitle":
        value = this.compInfoForm.value.jobtitle;
        break;
      case "rank":
        value = this.compInfoForm.value.rank;
        break;
      case "costcenter":
        value = this.compInfoForm.value.costcenter;
        break;
      case "division":
        value = this.compInfoForm.value.division;
        break;
    }
    
    this.dialogService.showSpinner();
    this.empService.updateEmployee(this.employee.id, field, value)
      .subscribe({
        next: (data: EmployeeResponse) => {
          this.dialogService.closeSpinner();
          if (data && data !== null && data.employee) {
            this.employee = new Employee(data.employee);
            const iEmp = this.empService.getEmployee();
            if (iEmp && iEmp.id === data.employee.id) {
              this.empService.setEmployee(data.employee);
            }
            this.changed.emit(new Employee(data.employee));
          }
        },
        error: (err: EmployeeResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      });
  }
}
