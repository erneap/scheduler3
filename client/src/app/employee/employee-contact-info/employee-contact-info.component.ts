import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Employee, IEmployee } from 'src/app/models/employees/employee';
import { ContactType } from 'src/app/models/teams/contacttype';
import { ITeam, Team } from 'src/app/models/teams/team';
import { AppStateService } from 'src/app/services/app-state.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
    selector: 'app-employee-contact-info',
    templateUrl: './employee-contact-info.component.html',
    styleUrls: ['./employee-contact-info.component.scss'],
    standalone: false
})
export class EmployeeContactInfoComponent {
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
  }
  get employee(): Employee {
    return this._employee;
  }
  @Input() width: number = 650;
  @Output() changed = new EventEmitter<Employee>();
  contactTypes: ContactType[] = [];

  constructor(
    protected teamService: TeamService,
    protected empService: EmployeeService,
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
      let width = Math.floor(this.appState.viewWidth - 44) / 2;
      this.width = width * 2;
    } else {
      this.width = 650;
    }
  }

  viewClass(): string {
    if (this.appState.isMobile() || this.appState.isTablet()) {
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

  contactStyle(): string {
    let ratio = this.width / 650;
    if (ratio > 1.0) ratio = 1.0;
    const cWidth = Math.floor(325 * ratio);
    return `width: ${cWidth}px;font-size: ${ratio * 1.2}rem;`
  }

  setContactTypes() {
    this.contactTypes = [];
    if (this.team) {
      this.team.contacttypes.forEach(ct => {
        this.contactTypes.push(new ContactType(ct));
      });
    }
    this.contactTypes = this.contactTypes.sort((a,b) => a.compareTo(b))
  }

  updatedEmployee(emp: Employee) {
    this.employee = emp;
    this.changed.emit(emp);
  }
}
