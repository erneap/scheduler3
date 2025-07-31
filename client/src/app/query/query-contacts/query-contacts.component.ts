import { Component, Input } from '@angular/core';
import { Contact } from 'src/app/models/employees/contact';
import { Employee, IEmployee } from 'src/app/models/employees/employee';
import { Team } from 'src/app/models/teams/team';
import { TeamService } from 'src/app/services/team.service';

@Component({
    selector: 'app-query-contacts',
    templateUrl: './query-contacts.component.html',
    styleUrls: ['./query-contacts.component.scss'],
    standalone: false
})
export class QueryContactsComponent {
  private _employee: Employee = new Employee();
  @Input()
  public set employee(e: IEmployee) {
    this._employee = new Employee(e);
    this.setContacts();
  }
  get employee(): Employee {
    return this._employee;
  }
  @Input() team: Team = new Team();
  contacts: Contact[] = [];
  otherEmails: string[] = [];

  constructor(
    protected teamService: TeamService
  ) {
    const iteam = this.teamService.getTeam();
    if (iteam) {
      this.team = new Team(iteam);
    }
  }

  setContacts() {
    this.contacts = [];
    if (this.employee.contactinfo) {
      this.employee.contactinfo.forEach(ct => {
        this.contacts.push(new Contact(ct));
      })
    }
    // add other email, if necessary
    this.otherEmails = [];
    let found = false;
    this.contacts.forEach(ct => {
      if (ct.value.toLowerCase() === this.employee.email.toLowerCase()) {
        found = true;
      }
    });
    if (!found) {
      this.otherEmails.push(this.employee.email);
    }
    if (this.employee.emails.length > 0) {
      this.employee.emails.forEach(email => {
        found = false;
        this.contacts.forEach(ct => {
          if (email.toLowerCase() === ct.value.toLowerCase()) {
            found = true;
          }
        });
        if (!found) {
          this.otherEmails.forEach(em => {
            if (em.toLowerCase() === email.toLowerCase()) {
              found = true;
            }
          });
          if (!found) {
            this.otherEmails.push(email);
          }
        }
      });
    }
  }

  itemClass(i: number): string {
    if (i % 2 === 0) {
      return 'cttype even';
    }
    return 'cttype odd';
  }

  emailClass(i: number): string {
    if ((this.contacts.length + i) % 2 === 0) {
      return 'cttype even';
    }
    return 'cttype odd';
  }

  contactType(ctID: number): string {
    let label = '';
    this.team.contacttypes.forEach(ct => {
      if (ct.id === ctID) {
        label = ct.name;
      }
    });
    return label;
  }
}
