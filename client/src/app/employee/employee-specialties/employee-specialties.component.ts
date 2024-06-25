import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ListItem } from 'src/app/generic/button-list/listitem';
import { Employee, IEmployee } from 'src/app/models/employees/employee';
import { SpecialtyType } from 'src/app/models/teams/contacttype';
import { ITeam, Team } from 'src/app/models/teams/team';
import { EmployeeResponse } from 'src/app/models/web/employeeWeb';
import { AppStateService } from 'src/app/services/app-state.service';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-employee-specialties',
  templateUrl: './employee-specialties.component.html',
  styleUrls: ['./employee-specialties.component.scss']
})
export class EmployeeSpecialtiesComponent {
  private _team: Team = new Team();
  @Input()
  public set team(tm: ITeam) {
    this._team = new Team(tm);
    this.setContactTypes();
  }
  get team(): Team {
    return this._team;
  }
  private _employee: Employee = new Employee();
  @Input()
  public set employee(emp: IEmployee) {
    this._employee = new Employee(emp);
    this.setContactTypes();
  }
  get employee(): Employee {
    return this._employee;
  }
  @Input() height: number = 700;
  @Input() width: number = 650;
  @Output() changed = new EventEmitter<Employee>();
  available: ListItem[] = [];
  specialties: ListItem[] = [];
  availableSelected: string[] = [];
  specialtiesSelected: string[] = [];

  constructor(
    protected teamService: TeamService,
    protected empService: EmployeeService,
    protected dialogService: DialogService,
    protected authService: AuthService,
    protected appState: AppStateService
  ) {
    if (this.team.id === '') {
      const tm = this.teamService.getTeam();
      if (tm) {
        this.team = tm;
      }
    }
    if (this.employee.id === '') {
      const emp = this.empService.getEmployee();
      if (emp) {
        this.employee = emp;
      }
    }
    if (this.appState.viewWidth < 694) {
      this.width = this.appState.viewWidth - 44;
      let cWidth = Math.floor((this.width - 50) / 2);
      this.width = (cWidth * 2) + 50;
    } else {
      this.width = 650;
    }
    this.height = this.appState.viewHeight - 200;
  }

  viewClass(): string {
    if (this.appState.isMobile() || this.appState.isTablet() || this.height < 600) {
      return "flexlayout column topleft";
    }
    return "fxLayout flexlayout column topleft";
  }

  cardClass(): string {
    if (this.appState.isMobile() || this.appState.isTablet()) {
      return "background-color: #673ab7;color: white; width: 100%;";
    }
    return "background-color: #673ab7;color: white;";
  }

  labelStyle(): string {
    let ratio = this.width / 650;
    if (ratio > 1.0) ratio = 1.0
    const lWidth = Math.floor(352 * ratio);
    const fontSize = 1.3 * ratio;
    return `width: ${lWidth}px;font-size: ${fontSize}rem;`;
  }

  listStyle(): string {
    let ratio = this.width / 650;
    if (ratio > 1.0) ratio = 1.0;
    let lWidth = Math.floor(300 * ratio);
    let height = Math.floor((this.height - 150) * ratio);
    return `width: ${lWidth}px;height: ${height}px;`;
  }

  itemStyle(): string {
    let ratio = this.width / 650;
    if (ratio > 1.0) ratio = 1.0;
    let lWidth = Math.floor(283 * ratio);
    let lHeight = Math.floor(30 * ratio)
    let fontSize = 1.1 * ratio;
    return `width: ${lWidth}px;font-size: ${fontSize}rem;`
      + `min-height: ${lHeight} !important`;
  }

  moveStyle(): string {
    let ratio = this.width / 650;
    if (ratio > 1.0) ratio = 1.0;
    let lWidth = Math.floor(50 * ratio);
    let gap = Math.floor(20 * ratio);
    return `width: ${lWidth}px;gap: ${gap}px;`
      + `height: ${this.height - 150}px;`;
  }

  iconStyle(): string {
    let ratio = this.width / 650;
    if (ratio > 1.0) ratio = 1.0;
    let lWidth = Math.floor(30 * ratio);
    let fontSize = Math.floor(30 * ratio);
    return `width: ${lWidth}px;height: ${lWidth}px;font-size: ${fontSize}pt;`;
  }

  setContactTypes() {
    this.available = [];
    this.specialties = [];
    this.team.specialties = this.team.specialties.sort((a,b) => a.compareTo(b));
    this.team.specialties.forEach(sp => {
      let found = false;
      this.employee.specialties.forEach(esp => {
        if (esp.specialtyid === sp.id) {
          found = true;
          this.specialties.push(new ListItem(`${esp.id}`, sp.name));
        }
      });
      if (!found) {
        this.available.push(new ListItem(`${sp.id}`, sp.name));
      }
    });
  }

  updatedEmployee(emp: Employee) {
    this.empService.setEmployee(emp);
    this.employee = emp;
  }

  getButtonClass(id: string, list: string) {
    let answer = "employee";
    if (list.toLowerCase() === 'available') {
      this.availableSelected.forEach(sel => {
        if (sel === id) {
          answer += " selected";
        }
      });
    } else {
      this.specialtiesSelected.forEach(sel => {
        if (sel === id) {
          answer += " selected";
        }
      });
    }
    return answer;
  }

  onSelect(id: string, list: string) {
    let pos = -1;
    if (list.toLowerCase() === 'available') {
      for (let i=0; i < this.availableSelected.length && pos < 0; i++) {
        if (this.availableSelected[i] === id) {
          pos = i;
        }
      }
      if (pos < 0) {
        this.availableSelected.push(id);
      } else {
        this.availableSelected.splice(pos, 1);
      }
    } else {
      for (let i=0; i < this.specialtiesSelected.length && pos < 0; i++) {
        if (this.specialtiesSelected[i] === id) {
          pos = i;
        }
      }
      if (pos < 0) {
        this.specialtiesSelected.push(id);
      } else {
        this.specialtiesSelected.splice(pos, 1);
      }
    }
  }

  onSetChanges(list: string) {
    const specialties: number[] = [];
    let action = '';
    if (list.toLowerCase() === 'available') {
      action = 'add';
      this.availableSelected.forEach(sel => {
        specialties.push(Number(sel));
      });
      this.availableSelected = [];
    } else {
      action = "delete";
      this.specialtiesSelected.forEach(sel => {
        specialties.push(Number(sel));
      });
      this.specialtiesSelected = [];
    }
    if (specialties.length > 0) {
      this.dialogService.showSpinner();
      this.authService.statusMessage = "Updating Employee Specialties";
      this.empService.updateEmployeeSpecialties(this.employee.id, action, 
        specialties).subscribe({
        next: (resp: EmployeeResponse) => {
          this.dialogService.closeSpinner();
          if (resp.employee) {
            this.employee = resp.employee;
            const iEmp = this.empService.getEmployee();
            if (iEmp && iEmp.id === resp.employee.id) {
              this.empService.setEmployee(resp.employee);
            }
            this.changed.emit(new Employee(resp.employee));
          }
        },
        error: (err: EmployeeResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = `Error: onSetChanges: ${err.exception}`;
        }
      });
    }
  }
}
