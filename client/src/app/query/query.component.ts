import { Component } from '@angular/core';
import { Employee } from '../models/employees/employee';
import { TeamService } from '../services/team.service';
import { QueryService } from '../services/query.service';
import { IngestResponse } from '../models/web/siteWeb';
import { DialogService } from '../services/dialog-service.service';
import { AuthService } from '../services/auth.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Team } from '../models/teams/team';

@Component({
  selector: 'app-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.scss']
})
export class QueryComponent {
  employees: Employee[] = [];
  selectedEmployee: Employee = new Employee();
  team: Team;
  query: FormGroup;

  constructor(
    protected teamService: TeamService,
    protected queryService: QueryService,
    protected dialog: DialogService,
    protected auth: AuthService,
    private fb: FormBuilder
  ) {
    this.team = new Team();
    const team = this.teamService.getTeam();
    if (team) {
      this.team = new Team(team);
    }
    this.query = this.fb.group({
      hours: 0,
      specialties: [],
    });
    this.onStartSimple();
  }

  itemClass(id: string): string {
    if (this.selectedEmployee.id === id) {
      return 'item selected';
    }
    return 'item';
  }

  onSelect(id: string) {
    this.employees.forEach(emp => {
      if (emp.id === id) {
        this.selectedEmployee = new Employee(emp);
      }
    });
  }

  onStartSimple() {
    this.dialog.showSpinner();
    this.selectedEmployee = new Employee();
    this.queryService.getBasic(this.team.id).subscribe({
      next: (resp: IngestResponse) => {
        this.employees = [];
        resp.employees.forEach(emp => {
          this.employees.push(new Employee(emp));
        });
        this.employees.sort((a,b) => a.compareTo(b));
        if (this.employees.length > 0) {
          this.selectedEmployee = new Employee(this.employees[0]);
        }
        this.dialog.closeSpinner();
      },
      error: (err: IngestResponse) => {
        this.dialog.showSpinner();
        this.auth.statusMessage = `Error in Query: ${err.exception}`;
      }
    });
  }

  onComplexStart() {
    this.dialog.showSpinner();
    this.selectedEmployee = new Employee();
    this.queryService.getQuery(this.team.id, this.query.value.hours, 
    this.query.value.specialties).subscribe({
      next: (resp: IngestResponse) => {
        this.employees = [];
        resp.employees.forEach(emp => {
          this.employees.push(new Employee(emp));
        });
        this.employees.sort((a,b) => a.compareTo(b));
        if (this.employees.length > 0) {
          this.selectedEmployee = new Employee(this.employees[0]);
        }
        this.dialog.closeSpinner();
      },
      error: (err: IngestResponse) => {
        this.dialog.showSpinner();
        this.auth.statusMessage = `Error in Query: ${err.exception}`;
      }
    });
  }
}
