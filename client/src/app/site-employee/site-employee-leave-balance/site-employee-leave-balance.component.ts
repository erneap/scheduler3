import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Employee, IEmployee } from 'src/app/models/employees/employee';
import { AnnualLeave } from 'src/app/models/employees/leave';
import { ISite, Site } from 'src/app/models/sites/site';
import { EmployeeResponse } from 'src/app/models/web/employeeWeb';
import { SiteResponse } from 'src/app/models/web/siteWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';
import { SiteEmployeeLeaveBalanceDialogComponent } from './site-employee-leave-balance-dialog/site-employee-leave-balance-dialog.component';

@Component({
  selector: 'app-site-employee-leave-balance',
  templateUrl: './site-employee-leave-balance.component.html',
  styleUrls: ['./site-employee-leave-balance.component.scss']
})
export class SiteEmployeeLeaveBalanceComponent {
  private _employee: Employee = new Employee();
  @Input()
  public set employee(iEmp: IEmployee) {
    this._employee = new Employee(iEmp);
    this.setAnnualLeaves();
  }
  get employee(): Employee {
    return this._employee;
  }
  private _site: Site = new Site();
  @Input()
  public set site(iSite: ISite) {
    this._site = new Site(iSite);
  }
  get site(): Site {
    return this._site;
  }
  @Output() changed = new EventEmitter<Employee>();

  balances: AnnualLeave[] = [];

  constructor(
    protected authService: AuthService,
    protected empService: EmployeeService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected dialogService: DialogService,
    protected dialog: MatDialog
  ) { }

  employeeChanged(emp: Employee) {
    this.changed.emit(new Employee(emp));
  }

  setAnnualLeaves() {
    this.balances = [];
    this.employee.balance.forEach(bal => {
      this.balances.push(new AnnualLeave(bal));
    });
    this.balances.sort((a,b) => b.compareTo(a));
  }

  AddLeaveBalance() {
    const dialogRef = this.dialog.open(SiteEmployeeLeaveBalanceDialogComponent,
      { width: '250px'});
    dialogRef.afterClosed().subscribe(result => {
      if (result !== '') {
        this.dialogService.showSpinner();
        this.authService.statusMessage = "Adding New Leave Balance";
        this.empService.createLeaveBalance(this.employee.id, Number(result))
        .subscribe({
          next: (data: EmployeeResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = 'Leave balance created';
            if (data && data !== null) {
              if (data.employee) {
                const site = this.siteService.getSite();
                if (site && site.employees) {
                  let found = false;
                  for (let e=0; e < site.employees.length && !found; e++) {
                    if (site.employees[e].id === data.employee.id) {
                      found = true;
                      site.employees[e] = new Employee(data.employee);
                    }
                  }
                  this.siteService.setSite(site);
                }
                this.siteService.setSelectedEmployee(new Employee(data.employee));
                const tEmp = this.empService.getEmployee();
                if (tEmp) {
                  if (tEmp.id === data.employee.id) {
                    this.empService.setEmployee(new Employee(data.employee));
                  }
                }
              }
            }
          },
          error: (err: SiteResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = err.exception;
          }
        })
      }
    });
  }

  addAllBalances() {
    const dialogRef = this.dialog.open(SiteEmployeeLeaveBalanceDialogComponent,
      { width: '250px'});
    dialogRef.afterClosed().subscribe(result => {
      if (result !== '') {
        const team = this.teamService.getTeam();
        if (this.site && team) { 
          this.dialogService.showSpinner();
          this.authService.statusMessage = "Adding New Leave Balance"
          this.empService.createAllLeaveBalances(team.id, this.site.id, 
            Number(result)).subscribe({
            next: (data: SiteResponse) => {
              this.dialogService.closeSpinner();
              if (data && data !== null) {
                if (data.site && data.site.employees) {
                  data.site.employees.forEach(emp => {
                    this.changed.emit(new Employee(emp))
                  });
                }
              }
              this.authService.statusMessage = "Update complete";
            },
            error: (err: SiteResponse) => {
              this.dialogService.closeSpinner();
              this.authService.statusMessage = err.exception;
            }
          });
        }
      }
    });
  }
}
