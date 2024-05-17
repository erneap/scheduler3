import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ListItem } from 'src/app/generic/button-list/listitem';
import { DeletionConfirmationComponent } from 'src/app/generic/deletion-confirmation/deletion-confirmation.component';
import { Company, CompanyHoliday, ICompany } from 'src/app/models/teams/company';
import { ITeam, Team } from 'src/app/models/teams/team';
import { SiteResponse } from 'src/app/models/web/siteWeb';
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
    this.selected = new CompanyHoliday();
    this.setHoliday();
  }

  setHolidays() {
    this.holidays = [];
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

  labelStyle(): string {
    let ratio = this.width / 250;
    if (ratio > 1.0) ratio = 1.0;
    const fontSize = 0.9 * ratio;
    const width = Math.floor(75 * ratio);
    return `width: ${width}px;font-size: ${fontSize}rem;`;
  }

  inputStyle(): string {
    let ratio = this.width / 250;
    if (ratio > 1.0) ratio = 1.0;
    const fontSize = 0.9 * ratio;
    const width = Math.floor(175 * ratio);
    return `width: ${width}px;font-size: ${fontSize}rem;`;
  }

  dateStyle(): string {
    let ratio = this.width / 250;
    if (ratio > 1.0) ratio = 1.0;
    const fontSize = 0.8 * ratio;
    const width = Math.floor(80 * ratio);
    return `width: ${width}px;font-size: ${fontSize}rem;border: none;`;
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
        }
      });
    }
    this.setHoliday();
  }

  showDate(date: Date): boolean {
    let now = new Date();
    now = new Date(Date.UTC(now.getFullYear(), 0, 1, 0, 0, 0, 0));
    return (date.getTime() >= now.getTime());
  }

  getDate(dt: Date): string {
    let answer = `${dt.getFullYear()}-`;
    if (dt.getMonth() < 9) {
      answer += '0';
    }
    answer += `${dt.getMonth() + 1}-`;
    if (dt.getDate() < 10) {
      answer += '0';
    }
    answer += `${dt.getDate()}`;
    return answer;
  }

  setHoliday() {
    this.showSortDown = false;
    this.showSortUp = false;
    this.holidayForm.controls['holiday'].setValue(this.selected.id);
    this.holidayForm.controls['name'].setValue(this.selected.name);
    this.holidayForm.controls['actual'].setValue(new Date());
    if (this.selected.sort > 0) {
      this.holidayForm.controls['holiday'].disable();
      if (this.selected.id.toLowerCase() === 'h') {
        this.showSortUp = (this.selected.sort > 1);
        this.showSortDown = (this.selected.sort < this.maxHoliday);
      } else if (this.selected.id.toLowerCase() === 'f') {
        this.showSortUp = (this.selected.sort > 1);
        this.showSortDown = (this.selected.sort < this.maxFloat);
      }
    } else {
      this.holidayForm.controls['holiday'].enable();
    }
  }

  onChangeSort(direction: string) {
    if (this.selected.sort > 0) {
      if ((direction.substring(0,1).toLowerCase() === 'u' && this.showSortUp)
        || (direction.substring(0,1).toLowerCase() === 'd' && this.showSortDown)) {      
        this.authService.statusMessage = 'Updating Company holiday';
        this.dialogService.showSpinner();
        this.teamService.updateTeamCompanyHoliday(this.team.id, this.company.id,
        `${this.selected.id}${this.selected.sort}`, 'move', direction)
        .subscribe({
          next: (data: SiteResponse) => {
            this.dialogService.closeSpinner();
            if (data && data != null && data.team) {
              this.team = data.team;
              if (this.team.companies) {
                this.team.companies.forEach(co => {
                  if (co.id === this.company.id) {
                    this.company = new Company(co);
                    if (this.company.holidays) {
                      this.company.holidays.forEach(hol => {
                        if (this.selected.name === hol.name) {
                          this.selected = new CompanyHoliday(hol);
                          this.setHoliday()
                        }
                      });
                    }
                  }
                });
              }
              this.changed.emit(this.team);
            }
          },
          error: (err: SiteResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = err.exception;
          }
        });
      }
    }
  }

  onDelete() {
    const dialogRef = this.dialog.open(DeletionConfirmationComponent, {
      data: {title: 'Confirm Company Holiday Deletion', 
      message: 'Are you sure you want to delete this Company Holiday?'},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.dialogService.showSpinner();
        this.teamService.deleteTeamCompanyHoliday(this.team.id, this.company.id, 
          `${this.selected.id}${this.selected.sort}`).subscribe({
          next: (data: SiteResponse) => {
            this.dialogService.closeSpinner();
            if (data && data != null && data.team) {
              this.team = data.team;
              if (this.team.companies) {
                this.team.companies.forEach(co => {
                  if (this.company.id === co.id) {
                    this.company = new Company(co);
                  }
                });
              }
              this.selected = new CompanyHoliday();
              this.setHoliday();
              this.changed.emit(this.team);
            }
          },
          error: (err: SiteResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = err.exception;
          }
        })
      }
    });
  }

  onAdd() {
    const holType = this.holidayForm.value.holiday;
    const name = this.holidayForm.value.name;
    const actual = new Date(this.holidayForm.value.actual);

    this.dialogService.showSpinner();
    this.teamService.addTeamCompanyHoliday(this.team.id, this.company.id, 
      holType, name, this.getDate(actual)).subscribe({
      next: (data: SiteResponse) => {
        this.dialogService.closeSpinner();
        if (data && data != null && data.team) {
          this.team = data.team;
          if (this.team.companies) {
            this.team.companies.forEach(co => {
              if (co.id === this.company.id) {
                this.company = new Company(co);
                if (this.company.holidays) {
                  this.company.holidays.sort((a,b) => a.compareTo(b));
                  this.company.holidays.forEach(hol => {
                    if (hol.id === holType) {
                      this.selected = new CompanyHoliday(hol);
                    }
                  })
                }
              }
            });
          }
          this.setHoliday();
        }
      },
      error: (err: SiteResponse) => {
        this.dialogService.closeSpinner();
        this.authService.statusMessage = err.exception;
      }
    });

  }

  onUpdate(field: string) {
    if (this.selected.sort > 0) {
      let value = '';
      if (field.toLowerCase() === 'name') {
        value = this.holidayForm.controls['name'].value;
      } else if (field.toLowerCase() === 'actual') {
        field = 'addactual';
        const tValue = new Date(this.holidayForm.controls['actual'].value);
        value = this.getDate(tValue);
      }
      if (value !== '') {
        this.dialogService.showSpinner();
        this.teamService.updateTeamCompanyHoliday(this.team.id, this.company.id,
          `${this.selected.id}${this.selected.sort}`, field, value).subscribe({
          next: (data: SiteResponse) => {
            this.dialogService.closeSpinner();
            if (data && data != null && data.team) {
              this.team = data.team;
              if (this.team.companies) {
                this.team.companies.forEach(co => {
                  if (co.id === this.company.id) {
                    this.company = new Company(co);
                    this.company.holidays.forEach(hol => {
                      if (hol.id === this.selected.id 
                        && hol.sort === this.selected.sort) {
                        this.selected = new CompanyHoliday(hol);
                        this.setHoliday();
                      }
                    });
                  }
                });
              }
              this.changed.emit(this.team);
            }
          },
          error: (err: SiteResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = err.exception;
          }
        });
      }
    }
  }

  onDeleteActual(date: string) {
    const dialogRef = this.dialog.open(DeletionConfirmationComponent, {
      data: {title: 'Confirm Company Holiday Reference Date Deletion', 
      message: 'Are you sure you want to delete this Company Holiday '
        + 'Reference date?'},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.dialogService.showSpinner();
        this.teamService.updateTeamCompanyHoliday(this.team.id, this.company.id, 
          `${this.selected.id}${this.selected.sort}`, 'removeactual', date)
          .subscribe({
          next: (data: SiteResponse) => {
            this.dialogService.closeSpinner();
            if (data && data != null && data.team) {
              this.team = data.team;
              if (this.team.companies) {
                this.team.companies.forEach(co => {
                  if (co.id === this.company.id) {
                    this.company = new Company(co);
                    this.company.holidays.forEach(hol => {
                      if (hol.id === this.selected.id 
                        && hol.sort === this.selected.sort) {
                        this.selected = new CompanyHoliday(hol);
                        this.setHoliday();
                      }
                    });
                  }
                });
              }
              this.changed.emit(this.team);
            }
          },
          error: (err: SiteResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = err.exception;
          }
        })
      }
    });
  }
  
  onClear() {
    this.selected = new CompanyHoliday();
    this.setHoliday();
  }
}
