import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ListItem } from 'src/app/generic/button-list/listitem';
import { Company, CompanyHoliday, ICompany } from 'src/app/models/teams/company';
import { ITeam, Team } from 'src/app/models/teams/team';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-team-editor-company-holiday',
  templateUrl: './team-editor-company-holiday.component.html',
  styleUrls: ['./team-editor-company-holiday.component.scss']
})
export class TeamEditorCompanyHolidayComponent {
  private _team: Team = new Team();
  @Input()
  public set team(t: ITeam) {
    this._team = new Team(t);
  }
  get team(): Team {
    return this._team;
  }
  private _company: Company = new Company();
  @Input()
  public set company(c: ICompany) {
    this._company = new Company(c);
    this.setHolidays();
  }
  get company(): Company {
    return this._company;
  }
  @Input() width: number = 250;
  @Output() changed = new EventEmitter<Team>()
  holidays: ListItem[] = [];
  selected: CompanyHoliday = new CompanyHoliday();
  showSortUp: boolean = false;
  showSortDown: boolean = false;
  maxFloat: number = 0;
  maxHoliday: number = 0;
  holidayForm: FormGroup;

  constructor(
    protected authService: AuthService,
    protected teamService: TeamService,
    protected dialogService: DialogService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.holidayForm = this.fb.group({
      holiday: '',
      name: ['', [Validators.required]],
      actual: new Date(),
    });
  }

  setHolidays() {
    this.holidays = [];
    this.selected = new CompanyHoliday();
    this.setHoliday();
    this.maxFloat = 0;
    this.maxHoliday = 0;
    this.holidays.push(new ListItem('new', 'Add New Holiday'));
    this.company.holidays.sort((a,b) => a.compareTo(b));
    this.company.holidays.forEach(hol => {
      const id = `${hol.id.toUpperCase()}${hol.sort}`;
      const label = `${id} - ${hol.name}`;
      this.holidays.push(new ListItem(id, label));
      if (hol.id.toLowerCase() === 'h' && hol.sort > this.maxHoliday) {
        this.maxHoliday = hol.sort
      } else if (hol.id.toLowerCase() === 'f' && hol.sort > this.maxFloat) {
        this.maxFloat = hol.sort;
      }
    });
  }

  listStyle(): string {
    let ratio = this.width / 250;
    if (ratio > 1.0) ratio = 1.0;
    const width = Math.floor(225 * ratio);
    let height = Math.floor(100 * ratio);
    height *= 2;
    return `width: ${width}px;height: ${height}px;`;
  }

  sortStyle(): string {
    let ratio = this.width / 250;
    if (ratio > 1.0) ratio = 1.0;
    const width = Math.floor(25 * ratio);
    let height = Math.floor(100 * ratio);
    height *= 2;
    return `width: ${width}px;height: ${height}px;`;
  }

  moveStyle(): string {
    let ratio = this.width / 250;
    if (ratio > 1.0) ratio = 1.0;
    const width = Math.floor(25 * ratio);
    const height = Math.floor(100 * ratio);
    return `width: ${width}px;height: ${height}px;`;
  }

  itemClass(id: string): string {
    const selectid = `${this.selected.id.toUpperCase()}${this.selected.sort}`;
    if (id.toLowerCase() === selectid.toLowerCase() 
      || (id === 'new' && this.selected.id.toLowerCase() === 'h' 
      && this.selected.sort === 0)) {
      return 'item selected';
    }
    return 'item';
  }

  itemStyle(): string {
    let ratio = this.width / 250;
    if (ratio > 1.0) ratio = 1.0;
    const fontSize = 0.9 * ratio;
    const width = Math.floor(225 * ratio);
    let height = Math.floor(20 * ratio);
    return `width: ${width}px;min-height: ${height}px;font-size: ${fontSize}rem;`;
  }

  formStyle(): string {
    let ratio = this.width / 250;
    if (ratio > 1.0) ratio = 1.0;
    const fontSize = 0.9 * ratio;
    const width = Math.floor(250 * ratio);
    return `width: ${width}px;font-size: ${fontSize}rem;`;
  }

  onSelect(id: string) {
    this.showSortDown = false;
    this.showSortUp = false;
    if (id === 'new') {
      this.selected = new CompanyHoliday();
    } else {
      this.company.holidays.forEach(hol => {
        const hid = `${hol.id.toUpperCase()}${hol.sort}`;
        if (hid === id) {
          this.selected = new CompanyHoliday(hol);
          if (hol.id.toLowerCase() === 'h') {
            if (hol.sort > 1) this.showSortUp = true;
            if (hol.sort < this.maxHoliday) this.showSortDown = true;
          } else if (hol.id.toLowerCase() === 'f') {
            if (hol.sort > 1) this.showSortUp = true;
            if (hol.sort < this.maxFloat) this.showSortDown = true;
          }
        }
      });
    }
    this.setHoliday();
  }

  setHoliday() {
    console.log(this.selected.id);
    this.holidayForm.controls['holiday'].setValue(this.selected.id);
    this.holidayForm.controls['name'].setValue(this.selected.name);
    this.holidayForm.controls['actual'].setValue(new Date())
  }

  onChangeSort(direction: string) {

  }

  onDelete() {
    
  }
}
