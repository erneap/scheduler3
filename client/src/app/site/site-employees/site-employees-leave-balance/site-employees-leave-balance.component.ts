import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Employee, IEmployee } from 'src/app/models/employees/employee';
import { AnnualLeave } from 'src/app/models/employees/leave';
import { ISite, Site } from 'src/app/models/sites/site';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';
import { SiteEmployeesLeaveBalanceDialogComponent } from './site-employees-leave-balance-dialog/site-employees-leave-balance-dialog.component';
import { SiteResponse } from 'src/app/models/web/siteWeb';
import { EmployeeResponse } from 'src/app/models/web/employeeWeb';

@Component({
  selector: 'app-site-employees-leave-balance',
  templateUrl: './site-employees-leave-balance.component.html',
  styleUrls: ['./site-employees-leave-balance.component.scss']
})
export class SiteEmployeesLeaveBalanceComponent {
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
    const dialogRef = this.dialog.open(SiteEmployeesLeaveBalanceDialogComponent,
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
                this.employee = data.employee;
                this.changed.emit(this.employee);
              }
            }
          },
          error: (err: EmployeeResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = err.exception;
          }
        })
      }
    });
  }

  addAllBalances() {
    const dialogRef = this.dialog.open(SiteEmployeesLeaveBalanceDialogComponent,
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
