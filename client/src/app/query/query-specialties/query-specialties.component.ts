import { Component, Input } from '@angular/core';
import { Specialty } from 'src/app/models/employees/contact';
import { Employee, IEmployee } from 'src/app/models/employees/employee';
import { Team } from 'src/app/models/teams/team';
import { TeamService } from 'src/app/services/team.service';

@Component({
    selector: 'app-query-specialties',
    templateUrl: './query-specialties.component.html',
    styleUrls: ['./query-specialties.component.scss'],
    standalone: false
})
export class QuerySpecialtiesComponent {
  private _employee: Employee = new Employee();
  @Input()
  public set employee(e: IEmployee) {
    this._employee = new Employee(e);
  }
  get employee(): Employee {
    return this._employee;
  }
  @Input() team: Team = new Team();

  constructor(
    protected teamService: TeamService
  ) {
    const iteam = this.teamService.getTeam();
    if (iteam) {
      this.team = new Team(iteam);
    }
  }

  specialtyLabel(sp: Specialty): string {
    let label = '';
    this.team.specialties.forEach(tsp => {
      if (tsp.id === sp.specialtyid) {
        label = tsp.name;
      }
    });
    return label;
  }

  specialtyClass(i: number): string {
    if (i % 2 === 0) {
      return 'cttype even';
    }
    return 'cttype odd';
  }
}
