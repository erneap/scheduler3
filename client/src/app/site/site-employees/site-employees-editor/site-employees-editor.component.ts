import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DeletionConfirmationComponent } from 'src/app/generic/deletion-confirmation/deletion-confirmation.component';
import { NoticeDialogComponent } from 'src/app/generic/notice-dialog/notice-dialog.component';
import { Employee, IEmployee } from 'src/app/models/employees/employee';
import { Site } from 'src/app/models/sites/site';
import { Team } from 'src/app/models/teams/team';
import { AppStateService } from 'src/app/services/app-state.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-site-employees-editor',
  templateUrl: './site-employees-editor.component.html',
  styleUrls: ['./site-employees-editor.component.scss']
})
export class SiteEmployeesEditorComponent {
  private _employee: Employee = new Employee();
  @Input()
  public set employee(iEmp: IEmployee) {
    this._employee = new Employee(iEmp);
  }
  get employee(): Employee {
    return this._employee;
  }
  @Input() site: Site = new Site();
  @Input() team: Team = new Team();
  private _width: number = 1048;
  @Input()
  public set width(w: number) {
    this._width = w - 70;
  }
  get width(): number {
    return this._width;
  }
  @Input() height: number = 850;

  @Output() employeeChanged = new EventEmitter<Employee>();
  @Output() employeeDelete = new EventEmitter<string>();

  constructor(
    protected empService: EmployeeService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected appState: AppStateService,
    protected dialog: MatDialog
  ) {
    this.height = this.appState.viewHeight - 220;
    const iSite = this.siteService.getSite();
    if (iSite) {
      this.site = new Site(iSite);
    }
    const iTeam = this.teamService.getTeam();
    if (iTeam) {
      this.team = new Team(iTeam);
    }
  }

  formWidth(): string {
    return `width: ${this.width-70}px;`;
  }

  changeEmployee(emp: Employee) {
    const iEmp = this.empService.getEmployee();
    if (iEmp && iEmp.id === emp.id) {
      this.empService.setEmployee(emp);
    }
    this.employee = emp;
    this.employeeChanged.emit(emp);
  }

  deleteEmployee(): void {
    const iEmp = this.empService.getEmployee();
    if (iEmp && iEmp.id !== this.employee.id) {
      const dialogRef = this.dialog.open(DeletionConfirmationComponent, {
        data: {title: 'Confirm Employee Deletion', 
        message: 'Are you sure you want to delete this employee?'},
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result === 'yes') {
          this.employeeDelete.emit(this.employee.id);
        }
      });

    } else {
      const dialogRef = this.dialog.open(NoticeDialogComponent, {
        data: {title: 'Unable To Delete', 
        message: 'You cannot delete yourself!'},
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === 'yes') {
          this.employeeDelete.emit(this.employee.id);
        }
      });
    }
  }

  positionStyle(): string {
    return `width: ${this.width - 70}px;height: ${this.height}px;`;
  }
}
