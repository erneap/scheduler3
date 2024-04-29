import { Component, Input } from '@angular/core';
import { Employee, IEmployee } from 'src/app/models/employees/employee';
import { Site } from 'src/app/models/sites/site';
import { Team } from 'src/app/models/teams/team';
import { AppStateService } from 'src/app/services/app-state.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-leave-request',
  templateUrl: './leave-request.component.html',
  styleUrls: ['./leave-request.component.scss']
})
export class LeaveRequestComponent {
  private _employee: Employee;
  @Input()
  public set employee(emp: IEmployee) {
    this._employee = new Employee(emp);
  }
  get employee(): Employee {
    return this._employee;
  }

  constructor(
    protected empService: EmployeeService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected appState: AppStateService
  ) { 
    const iEmp = this.empService.getEmployee();
    if (iEmp) {
      this._employee = new Employee(iEmp);
    } else {
      this._employee = new Employee();
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

  changedEmployee(iEmp: Employee) {
    this.empService.setEmployee(iEmp);
    const iSite = this.siteService.getSite();
    if (iSite) {
      const site = new Site(iSite);
      if (site.employees) {
        for (let i=0; i < site.employees.length; i++) {
          if (site.employees[i].id === iEmp.id) {
            site.employees[i] = new Employee(iEmp);
          }
        }
        this.siteService.setSite(site);
        const iTeam = this.teamService.getTeam();
        if (iTeam) {
          const team = new Team(iTeam);
          if (team.sites) {
            for (let i=0; i < team.sites.length; i++) {
              if (team.sites[i].id === site.id) {
                team.sites[i] = site;
                this.teamService.setTeam(team);
              }
            }
          }
        }
      }
    }
    this.employee = iEmp;
  }
}
