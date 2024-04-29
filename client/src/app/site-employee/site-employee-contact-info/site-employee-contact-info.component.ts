import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Employee, IEmployee } from 'src/app/models/employees/employee';
import { ContactType } from 'src/app/models/teams/contacttype';
import { Team } from 'src/app/models/teams/team';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-site-employee-contact-info',
  templateUrl: './site-employee-contact-info.component.html',
  styleUrls: ['./site-employee-contact-info.component.scss']
})
export class SiteEmployeeContactInfoComponent {
  private _employee: Employee = new Employee();
  @Input()
  public set employee(iEmp: IEmployee) {
    this._employee = new Employee(iEmp);
  }
  get employee(): Employee {
    return this._employee;
  }
  @Output() changed = new EventEmitter<Employee>();
  team: Team;
  contactTypes: ContactType[];

  constructor(
    protected teamService: TeamService,
    protected siteService: SiteService
  ) {
    this.contactTypes = [];
    const tm = this.teamService.getTeam();
    if (tm) {
      this.team = new Team(tm);
      this.team.contacttypes.forEach(ct => {
        this.contactTypes.push(new ContactType(ct));
      });
    } else {
      this.team = new Team();
    }
  }

  updatedEmployee(emp: Employee) {
    this.siteService.setSelectedEmployee(emp);
    this.employee = emp;
  }
}
