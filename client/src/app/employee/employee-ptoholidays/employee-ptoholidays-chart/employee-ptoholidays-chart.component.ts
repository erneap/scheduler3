import { Component, Input } from '@angular/core';
import { Employee, IEmployee } from 'src/app/models/employees/employee';
import { Team } from 'src/app/models/teams/team';
import { AppStateService } from 'src/app/services/app-state.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-employee-ptoholidays-chart',
  templateUrl: './employee-ptoholidays-chart.component.html',
  styleUrl: './employee-ptoholidays-chart.component.scss'
})
export class EmployeePTOHolidaysChartComponent {
  private _employee: Employee = new Employee();
  @Input()
  public set employee(iEmp: IEmployee) {
    this._employee = new Employee(iEmp);
    this.setShowHolidays();
  }
  get employee(): Employee {
    return this._employee;
  }
  @Input() width: number = 920;
  year: number = (new Date()).getFullYear();
  showHolidays: boolean = false;

  constructor(
    protected empService: EmployeeService,
    protected teamService: TeamService,
    protected stateService: AppStateService
  ) {
    const iEmp = this.empService.getEmployee();
    if (iEmp) {
      this.employee = iEmp;
    }
  }

  updateYear(direction: string) {
    if (direction.substring(0,1).toLowerCase() === 'u') {
      this.year++;
    } else if (direction.substring(0,1).toLowerCase() === 'd') {
      this.year--;
    }
  }

  setShowHolidays() {
    this.showHolidays = false;
    this.year = (new Date()).getFullYear();
    const iTeam = this.teamService.getTeam();
    if (iTeam) {
      const team = new Team(iTeam);
      team.companies.forEach(co => {
        if (co.id.toLowerCase() === this.employee.companyinfo.company.toLowerCase()) {
          this.showHolidays = co.holidays.length > 0;
        }
      });
    }
  }

  getDisplayClass(): string {
    return`flexlayout topcenter ${this.getDirection()}`;
  }

  getDirection(): string {
    if (this.width < 475) {
      return "column";
    }
    return "row";
  }

  getPortionWidth(): number {
    let width = this.getWidth();
    if (this.getDirection() === 'column') {
      if (width > 455) {
        return 455;
      }
      return width;
    }
    if (!this.showHolidays) {
      return width;
    }
    return Math.floor(width / 2);
  }

  getWidth(): number {
    let width = 455;
    if (this.showHolidays) {
      width += 455;
    }
    if (width > this.width) {
      return this.width;
    }
    return width;
  }

  yearStyle(): string {
    return `width: ${this.getWidth() + 15 }px;`;
  }

  directionStyle(): string {
    let width = Math.floor(this.getWidth() / 3);
    if (width > 100) {
      return `width: 100px;`;
    }
    return `width: ${width}px;`;
  }
}
