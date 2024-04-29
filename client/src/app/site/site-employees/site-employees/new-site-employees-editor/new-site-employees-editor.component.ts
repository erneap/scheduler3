import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Assignment, Schedule } from 'src/app/models/employees/assignments';
import { Employee, EmployeeLaborCode } from 'src/app/models/employees/employee';
import { AnnualLeave } from 'src/app/models/employees/leave';
import { ISite, Site } from 'src/app/models/sites/site';
import { Workcenter } from 'src/app/models/sites/workcenter';
import { Company } from 'src/app/models/teams/company';
import { MustMatchValidator } from 'src/app/models/validators/must-match-validator.directive';
import { PasswordStrengthValidator } from 'src/app/models/validators/password-strength-validator.directive';
import { EmployeeResponse } from 'src/app/models/web/employeeWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-site-new-employee-editor',
  templateUrl: './new-site-employees-editor.component.html',
  styleUrls: ['./new-site-employees-editor.component.scss']
})
export class NewSiteEmployeesEditorComponent {
  private _site: Site = new Site();
  @Input()
  public set site(iSite: ISite) {
    this._site = new Site(iSite);
    this.siteid = this._site.id;
    this.setLaborCodes();
    this.setWorkcenters();
  }
  get site(): Site {
    return this._site;
  }
  @Input() width: number = 1048;
  @Output() employeeChanged = new EventEmitter<Employee>();
  employee: Employee = new Employee();
  employeeForm: FormGroup;
  companies: Company[] = [];
  laborcodes: EmployeeLaborCode[] = [];
  workcenters: Workcenter[] = [];
  schedule: Schedule;
  teamid: string = '';
  siteid: string = '';
  newError: string = '';

  constructor(
    protected teamService: TeamService,
    protected siteService: SiteService,
    protected empService: EmployeeService,
    protected dialogService: DialogService,
    protected authService: AuthService,
    protected router: Router,
    private fb: FormBuilder
  ) {
    this.companies = [];
    const team = this.teamService.getTeam();
    if (team && team.companies && team.companies.length > 0) {
      this.teamid = team.id;
      team.companies.forEach(co => {
        this.companies.push(new Company(co));
      });
    }
    const site = this.siteService.getSite();
    this.setLaborCodes();
    this.setWorkcenters();
    if (this.employee.assignments.length === 0) {
      const asgmt = new Assignment();
      asgmt.id = 1;
      asgmt.startDate = new Date();
      asgmt.endDate = new Date(9999, 12, 30);
      if (asgmt.schedules.length === 0) {
        const sched = new Schedule();
        if (sched.workdays.length === 0) {
          sched.setScheduleDays(7);
        }
        asgmt.schedules.push(sched);
      }
      this.employee.assignments.push(asgmt);
    }
    this.schedule = this.employee.assignments[0].schedules[0];
    this.siteService.setSelectedEmployee(new Employee());
    this.employeeForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      first: ['', [Validators.required]],
      middle: '',
      last: ['', [Validators.required]],
      password: ['', [Validators.required, new PasswordStrengthValidator()]],
      password2: ['', [Validators.required, new MustMatchValidator()]],
      company: ['', [Validators.required]],
      employeeid: ['', [Validators.required]],
      alternateid: '',
      jobtitle: ['', [Validators.required]],
      rank: '',
      costcenter: '',
      division: '',
      laborcode: '',
      workcenter: '',
      startdate: new Date(),
    });
  }

  formWidth(): string {
    return `width: ${this.width-70}px;`;
  }

  accordionWidth(): string {
    return `width: ${this.width - 100}px;`;
  }

  setLaborCodes() {
    const now = new Date();
    this.laborcodes = [];
    if (this.site) {
      this.siteid = this.site.id;
      if ( this.site.forecasts && this.site.forecasts.length > 0) {
        this.site.forecasts.forEach(rpt => {
          if (rpt.startDate.getTime() <= now.getTime() 
            && rpt.endDate.getTime() >= now.getTime() 
            && rpt.laborCodes && rpt.laborCodes.length > 0) {
            rpt.laborCodes.forEach(lc => {
              if (!lc.exercise) {
                const labor = new EmployeeLaborCode();
                labor.chargeNumber = lc.chargeNumber;
                labor.extension = lc.extension;
                this.laborcodes.push(labor);
              }
            });
          }
        });
        this.laborcodes.sort((a,b) => a.compareTo(b));
      }
    }
  }

  setWorkcenters() {
    this.workcenters = [];
    if (this.site) {
      this.siteid = this.site.id;
      if (this.site.workcenters && this.site.workcenters.length > 0) {
        this.site.workcenters.forEach(wc => {
          this.workcenters.push(new Workcenter(wc));
        });
      }
    }
  }

  clearForm() {
    this.employeeForm.controls['newemail'].setValue('');
    this.employeeForm.controls['first'].setValue('');
    this.employeeForm.controls['middle'].setValue('');
    this.employeeForm.controls['last'].setValue('');
    this.employeeForm.controls['newpassword'].setValue('');
    this.employeeForm.controls['password2'].setValue('');
    this.employeeForm.controls['company'].setValue('');
    this.employeeForm.controls['employeeid'].setValue('');
    this.employeeForm.controls['alternateid'].setValue('');
    this.employeeForm.controls['jobtitle'].setValue('');
    this.employeeForm.controls['rank'].setValue('');
    this.employeeForm.controls['costcenter'].setValue('');
    this.employeeForm.controls['division'].setValue('');
    this.employeeForm.controls['laborcode'].setValue('');
    this.employeeForm.controls['workcenter'].setValue('');
    this.employeeForm.controls['startdate'].setValue(new Date());
  }

  getPasswordError(): string {
    let answer: string = ''
    if (this.employeeForm.get('password')?.hasError('required')) {
      answer = "Password is Required";
    }
    if (this.employeeForm.get('password')?.hasError('passwordStrength')) {
      if (answer !== '') {
        answer += ', ';
      }
      answer += "Password doesn't meet minimum requirements";
    }
    return answer;
  }

  getVerifyError(): string {
    let answer: string = ''
    if (this.employeeForm.get('password2')?.hasError('required')) {
      answer = "Password is Required";
    }
    if (this.employeeForm.get('password2')?.hasError('matching')) {
      if (answer !== '') {
        answer += ', ';
      }
      answer += "Password doesn't match";
    }
    return answer;
  }

  changeAssignmentSchedule(data: string) {
    if (typeof data === "string") {
      const chgParts = data.split('|');
      const field = chgParts[3];
      if (chgParts[0].toLowerCase() === 'workday') {
        if (chgParts[2] !== '') {
          const workday = Number(chgParts[2]);
          let found = false;
          for (let i=0; 
            i < this.employee.assignments[0].schedules[0].workdays.length 
            && !found; i++) {
            const wd = this.employee.assignments[0].schedules[0].workdays[i];
            if (wd.id === workday) {
              switch (field.toLowerCase()) {
                case "code":
                  wd.code = chgParts[4];
                  break;
                case "workcenter":
                  wd.workcenter = chgParts[4];
                  break;
                case "hours":
                  const hrs = Number(chgParts[4]);
                  wd.hours = hrs;
                  break;
              }
              found = true;
              this.employee.assignments[0].schedules[0].workdays[i] = wd;
            }
          }
        }
      } else {
        if (field.toLowerCase() === 'changeschedule') {
          const days = Number(chgParts[4]);
          this.schedule.setScheduleDays(days);
          this.schedule = new Schedule(this.schedule);
        }
      }
    }
  }

  addEmployee() {
    this.employee.team = this.teamid;
    this.employee.site = this.siteid;
    this.employee.name.first = this.employeeForm.value.first;
    this.employee.name.middle = this.employeeForm.value.middle;
    this.employee.name.last = this.employeeForm.value.last;
    this.employee.email = this.employeeForm.value.email;
    const passwd = this.employeeForm.value.password;
    this.employee.companyinfo.company = this.employeeForm.value.company;
    this.employee.companyinfo.employeeid 
      = this.employeeForm.value.employeeid;
    this.employee.companyinfo.alternateid 
      = this.employeeForm.value.alternateid;
    this.employee.companyinfo.jobtitle = this.employeeForm.value.jobtitle;
    this.employee.companyinfo.rank = this.employeeForm.value.rank;
    this.employee.companyinfo.costcenter = this.employeeForm.value.costcenter;
    this.employee.companyinfo.division = this.employeeForm.value.division;
    const labor: string = this.employeeForm.value.laborcode;
    const laborParts = labor.split("|");
    const laborcode = new EmployeeLaborCode({
      chargeNumber: laborParts[0],
      extension: laborParts[1],
    });
    this.employee.assignments[0].site = this.siteid;  
    this.employee.assignments[0].workcenter = this.employeeForm.value.workcenter;
    const start:Date = new Date(this.employeeForm.value.startdate);
    this.employee.assignments[0].startDate = new Date(Date.UTC(start.getFullYear(),
      start.getMonth(), start.getDate()));
    this.employee.assignments[0].endDate = new Date(Date.UTC(9999, 11, 30));
    this.employee.assignments[0].schedules[0] = this.schedule;
    if (this.employee.assignments[0].laborcodes.length === 0) {
      this.employee.assignments[0].laborcodes.push(laborcode);
    } else {
      this.employee.assignments[0].laborcodes[0] = laborcode;
    }
    const balance = new AnnualLeave({
      year: (new Date()).getFullYear(),
      annual: 120.0,
      carryover: 0.0
    });
    this.employee.balance.push(balance);

    this.dialogService.showSpinner();
    this.authService.statusMessage = "Creating New Employee";
    this.empService.addEmployee(this.employee, passwd, this.teamid, this.siteid)
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
            let found = false;
            if (this.site.employees) {
              for (let i=0; i < this.site.employees.length && !found; i++) {
                if (this.site.employees[i].id === this.employee.id) {
                  found = true;
                  this.site.employees[i] = new Employee(this.employee);
                }
              }
            } else {
              this.site.employees = [];
            }
            if (!found) {
              this.site.employees.push(new Employee(this.employee));
            }
            this.employeeChanged.emit(this.employee);
          }
          this.authService.statusMessage = "Employee Created";
        },
        error: (err: EmployeeResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      });
  }
}
