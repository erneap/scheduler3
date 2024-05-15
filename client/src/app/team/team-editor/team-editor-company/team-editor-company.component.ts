import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ListItem } from 'src/app/generic/button-list/listitem';
import { Company, ICompany } from 'src/app/models/teams/company';
import { ITeam, Team } from 'src/app/models/teams/team';

@Component({
  selector: 'app-team-editor-company',
  templateUrl: './team-editor-company.component.html',
  styleUrls: ['./team-editor-company.component.scss']
})
export class TeamEditorCompanyComponent {
  private _team: Team = new Team();
  @Input()
  public set team(t: ITeam) {
    this._team = new Team(t);
    this.setCompanies()
  }
  get team(): Team {
    return this._team;
  }
  private _width: number = 770;
  @Input()
  public set width(w: number) {
    if (w > 770) {
      w = 770;
    }
    this.columnWidth = Math.floor((w - 20) / 3);
    this._width = (this.columnWidth * 3) + 20;
  }
  get width(): number {
    return this._width;
  }
  @Output() changed = new EventEmitter<Team>()
  columnWidth: number = 250;
  companies: ListItem[] = [];
  selected: Company = new Company();

  constructor() {

  }

  setCompanies() {
    this.companies = [];
    this.companies.push(new ListItem('new', 'Add New Company'));
    if (this.team.companies) {
      this.team.companies.sort((a,b) => a.compareTo(b));
      this.team.companies.forEach(co => {
        this.companies.push(new ListItem(co.id, co.name));
        if (co.id.toLowerCase() === 'rtx') {
          this.selected = new Company(co);
        }
      })
    }
  }

  editorStyle(): string {
    return `width: ${this.columnWidth}px;`;
  }
}
