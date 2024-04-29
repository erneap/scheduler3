import { Component } from '@angular/core';
import { Employee } from '../models/employees/employee';
import { TeamService } from '../services/team.service';
import { QueryService } from '../services/query.service';
import { IngestResponse } from '../models/web/siteWeb';
import { DialogService } from '../services/dialog-service.service';
import { AuthService } from '../services/auth.service';
import { ContactType, SpecialtyType } from '../models/teams/contacttype';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.scss']
})
export class QueryComponent {
  employees: Employee[] = [];
  selectedEmployee: Employee = new Employee();
  selected: string = '';
  contactTypes: ContactType[];
  specialtyTypes: SpecialtyType[];
  teamid: string = "";
  query: FormGroup;

  constructor(
    protected teamService: TeamService,
    protected queryService: QueryService,
    protected dialog: DialogService,
    protected auth: AuthService,
    private fb: FormBuilder
  ) {
    const team = this.teamService.getTeam();
    this.contactTypes = [];
    this.specialtyTypes = [];
    if (team) {
      this.teamid = team.id;
      team.contacttypes.forEach(ct => {
        this.contactTypes.push(new ContactType(ct))
      });
      this.contactTypes.sort((a,b) => a.compareTo(b));
      team.specialties.forEach(sp => {
        this.specialtyTypes.push(new SpecialtyType(sp));
      });
      this.specialtyTypes.sort((a,b) => a.compareTo(b));
    }
    this.query = this.fb.group({
      hours: 0,
      specialties: [],
    });
    this.onStartSimple();
  }

  onSelect(id: string) {
    this.selected = id;
    this.employees.forEach(emp => {
      if (emp.id === id) {
        this.selectedEmployee = new Employee(emp);
      }
    });
  }

  getButtonClass(id: string) {
    if (this.selected === id) {
      return "employee selected";
    } else {
      return "employee ";
    }
  }
  
  getListStyle(): string {
    const screenHeight = window.innerHeight;
    let listHeight = screenHeight - 130;
    return `height: ${listHeight}px;`;
  }
  
  getQueryStyle(): string {
    const screenHeight = window.innerHeight;
    let listHeight = screenHeight - 130;
    return `width: 300px;height: ${listHeight}px;`;
  }

  onStartSimple() {
    this.dialog.showSpinner();
    this.selectedEmployee = new Employee();
    this.queryService.getBasic(this.teamid).subscribe({
      next: (resp: IngestResponse) => {
        this.employees = [];
        resp.employees.forEach(emp => {
          this.employees.push(new Employee(emp));
        });
        this.employees.sort((a,b) => a.compareTo(b));
        if (this.employees.length > 0) {
          this.selected = this.employees[0].id;
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

  hasContact(contactID: number): boolean {
    let answer = false;
    this.selectedEmployee.contactinfo.forEach(ci => {
      if (ci.typeid === contactID) {
        answer = true;
      }
    })
    return answer
  }

  contactLabel(contactID: number): string {
    let answer = "";
    this.contactTypes.forEach(ct => {
      if (ct.id === contactID) {
        answer = ct.name;
      }
    });
    return answer;
  }

  contactValue(contactID: number): string {
    let answer = "";
    this.selectedEmployee.contactinfo.forEach(ci => {
      if (ci.typeid === contactID) {
        answer = ci.value;
      }
    })
    return answer
  }

  hasSpecialty(specID: number): boolean {
    let answer = false;
    this.selectedEmployee.specialties.forEach(ci => {
      if (ci.specialtyid === specID) {
        answer = true;
      }
    })
    return answer
  }

  specialtyLabel(specID: number): string {
    let answer = "";
    this.specialtyTypes.forEach(ct => {
      if (ct.id === specID) {
        answer = ct.name;
      }
    });
    return answer;
  }

  onComplexStart() {
    this.dialog.showSpinner();
    this.selected = '';
    this.selectedEmployee = new Employee();
    this.queryService.getQuery(this.teamid, this.query.value.hours, 
    this.query.value.specialties).subscribe({
      next: (resp: IngestResponse) => {
        this.employees = [];
        resp.employees.forEach(emp => {
          this.employees.push(new Employee(emp));
        });
        this.employees.sort((a,b) => a.compareTo(b));
        if (this.employees.length > 0) {
          this.selected = this.employees[0].id;
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
