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
  selector: 'app-team-company-holidays',
  templateUrl: './team-company-holidays.component.html',
  styleUrls: ['./team-company-holidays.component.scss']
})
export class TeamCompanyHolidaysComponent {
  private _team: Team = new Team();
  private _company?: Company = new Company();
  @Input()
  public set team(iTeam: ITeam) {
    this._team = new Team(iTeam);
  }
  get team(): Team {
    return this._team;
  }
  @Input()
  public set company(iCompany: ICompany | undefined) {
    if (iCompany) {
      this._company = new Company(iCompany);
    } else {
      this._company = new Company();
    }
    this.setHolidays();
  }
  get company(): Company {
    if (this._company) {
      return this._company;
    }
    return new Company();
  }
  @Output() teamChanged = new EventEmitter<Team>();
  holidays: ListItem[] = [];
  holidayMap = new Map<string, CompanyHoliday>()
  selected: string = 'new'
  dateSelected: string;
  holiday?: CompanyHoliday
  holidayForm: FormGroup;
  showSortUp: boolean = false;
  showSortDown: boolean = false;
  actualDates: ListItem[] = [];
  actualSelected: string = '';
  maxHolidaysSort: number = -1;
  maxFloaterSort: number = -1;

  constructor(
    protected authService: AuthService,
    protected dialogService: DialogService,
    protected teamService: TeamService,
    protected dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.holidayForm = this.fb.group({
      holtype: ['H', [Validators.required]],
      name: ['', [Validators.required]],
      actual: '',
    });
    const now = new Date();
    this.dateSelected = `${now.getFullYear()}`;
  }

  setHolidays() {
    this.holidays = [];
    this.holidayMap = new Map<string, CompanyHoliday>()
    this.holidays.push(new ListItem('new', 'Add New Holiday'));
    if (this.company.holidays) {
      const holidays = this.company.holidays.sort((a,b) => a.compareTo(b));
      holidays.forEach(hol => {
        if (hol.id.toLowerCase() === 'h' && this.maxHolidaysSort < hol.sort) {
          this.maxHolidaysSort = hol.sort;
        }  
        if (hol.id.toLowerCase() === 'f' && this.maxFloaterSort < hol.sort) {
          this.maxFloaterSort = hol.sort;
        }
        const id = `${hol.id}${hol.sort}`;
        this.holidayMap.set(id, hol);
        const label = `${id} - ${hol.name}`;
        this.holidays.push(new ListItem(id, label));
      });
    }
  }

  getButtonClass(id: string) {
    let answer = 'employee';
    if (this.selected === id) {
      answer += ' active';
    }
    return answer;
  }

  onSelect(id: string) {
    this.selected = id;
    this.actualDates = [];
    this.showSortDown = false;
    this.showSortUp = false;
    this.holiday = this.holidayMap.get(id); 
    if (this.holiday) {
      if (this.holiday.id.toLowerCase() === 'h') {
        this.showSortUp = this.holiday.sort > 1;
        this.showSortDown = this.holiday.sort < this.maxHolidaysSort;
      } else if (this.holiday.id.toLowerCase() === 'f') {
        this.showSortUp = this.holiday.sort > 1;
        this.showSortDown = this.holiday.sort < this.maxFloaterSort;
      }
    } 
    if (id === 'new') {
      this.holiday = undefined;
    }
    this.setHoliday();
  }

  getDateString(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug',
      'Sep', 'Oct', 'Nov', 'Dec'];
    return`${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  setHoliday() {
    this.actualDates = [];
    this.actualSelected = '';
    if (this.holiday) {
      const actuals = this.holiday.actualdates.reverse();
      if (actuals.length > 0) {
        this.actualSelected = `${actuals[0].getTime()}`;
      }
      actuals.forEach(act => {
        this.actualDates.push(new ListItem(`${act.getFullYear()}`, 
          this.getDateString(act)));
      });
      this.holidayForm.controls['holtype'].setValue(this.holiday.id);
      this.holidayForm.controls['holtype'].disable();
      this.holidayForm.controls['name'].setValue(this.holiday.name);
      this.holidayForm.controls['actual'].setValue(actuals[0]);
    } else {
      this.holidayForm.controls['holtype'].setValue('H');
      this.holidayForm.controls['holtype'].enable();
      this.holidayForm.controls['name'].setValue('');
      this.holidayForm.controls['actual'].setValue('');
    }
  }

  onChangeSort(direction: string) {
    if (this.selected !== 'new') {
      if ((direction.substring(0,1).toLowerCase() === 'u' && this.showSortUp)
        || (direction.substring(0,1).toLowerCase() === 'd' && this.showSortDown)) {      
        this.authService.statusMessage = 'Updating Company holiday';
        this.dialogService.showSpinner();
        this.teamService.updateTeamCompanyHoliday(this.team.id, this.company.id,
        this.selected, 'move', direction).subscribe({
          next: (data: SiteResponse) => {
            this.dialogService.closeSpinner();
            if (data && data != null && data.team) {
              this.team = data.team;
              this.teamService.setTeam(data.team);
              if (this.team.companies) {
                this.team.companies.forEach(co => {
                  if (co.id === this.company.id) {
                    this.company = new Company(co);
                    if (this.company.holidays) {
                      this.company.holidays.forEach(hol => {
                        if (this.holiday && this.holiday.name === hol.name) {
                          this.onSelect(`${hol.id}${hol.sort}`);
                        }
                      });
                    }
                    this.holiday = this.holidayMap.get(this.selected);
                    this.setHoliday()
                  }
                });
              }
              this.teamService.setTeam(data.team);
              this.teamChanged.emit(new Team(data.team));
            }
            this.authService.statusMessage = "Addition complete";
          },
          error: (err: SiteResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = err.exception;
          }
        });
      }
    }
  }

  onUpdate(field: string) {
    if (this.selected !== 'new') {
      let sValue = '';
      const value = this.holidayForm.controls[field].value;
      if (field.toLowerCase() === 'actual') {
        sValue = this.getDate(new Date(value));
      } else {
        sValue = value;
      }
      this.authService.statusMessage = 'Updating Company holiday';
      this.dialogService.showSpinner();
      this.teamService.updateTeamCompanyHoliday(this.team.id, this.company.id,
      this.selected, field, sValue).subscribe({
        next: (data: SiteResponse) => {
          this.dialogService.closeSpinner();
          if (data && data != null && data.team) {
            this.team = data.team;
            this.teamService.setTeam(data.team);
            if (this.team.companies) {
              this.team.companies.forEach(co => {
                if (co.id === this.company.id) {
                  this.company = new Company(co);
                  this.holiday = this.holidayMap.get(this.selected);
                  this.setHoliday()
                }
              });
            }
            this.teamService.setTeam(data.team);
            this.teamChanged.emit(new Team(data.team));
          }
          this.authService.statusMessage = "Addition complete";
        },
        error: (err: SiteResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      });
    }
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

  onAdd() {
    if (this.selected === 'new' && this.holidayForm.valid) {
      this.authService.statusMessage = "Adding company holiday"
      this.dialogService.showSpinner();
      const actual = this.holidayForm.value.actual;
      let sActual = '';
      if (actual !== null) {
        sActual = this.getDate(new Date(actual));
      }
      const holType = this.holidayForm.value.holtype;
      this.teamService.addTeamCompanyHoliday(this.team.id, this.company.id, 
      holType, this.holidayForm.value.name, sActual)
      .subscribe({
        next: (data: SiteResponse) => {
          this.dialogService.closeSpinner();
          if (data && data != null && data.team) {
            this.team = data.team;
            if (this.team.companies) {
              this.team.companies.forEach(co => {
                if (co.id === this.company.id) {
                  this.company = new Company(co);
                  let maxID = -1;
                  if (this.company.holidays) {
                    this.company.holidays.forEach(hol => {
                      if (hol.id === holType && maxID < hol.sort) {
                        maxID = hol.sort;
                      }
                    });
                  }
                  this.onSelect(`${holType}${maxID}`);
                  this.holiday = this.holidayMap.get(this.selected);
                  this.setHoliday()
                }
              });
            }
            this.teamService.setTeam(data.team);
            this.teamChanged.emit(new Team(data.team));
          }
          this.authService.statusMessage = "Addition complete";
        },
        error: (err: SiteResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      })
    }
  }

  onDelete() {
    const dialogRef = this.dialog.open(DeletionConfirmationComponent, {
      data: {title: 'Confirm Company Holiday Deletion', 
      message: 'Are you sure you want to delete this Company Holiday?'},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.authService.statusMessage = "Delete team company holiday";
        this.dialogService.showSpinner();
        this.teamService.deleteTeamCompanyHoliday(this.team.id, this.company.id, 
          this.selected).subscribe({
          next: (data: SiteResponse) => {
            this.dialogService.closeSpinner();
            if (data && data != null && data.team) {
              this.team = data.team;
              if (this.team.companies) {
                this.team.companies.forEach(co => {
                  if (co.id === this.company.id) {
                    this.company = new Company(co);
                    this.onSelect('new');
                    this.holiday = this.holidayMap.get(this.selected);
                    this.setHoliday()
                  }
                });
              }
              this.teamService.setTeam(data.team);
              this.teamChanged.emit(new Team(data.team));
            }
            this.authService.statusMessage = "Addition complete";
          },
          error: (err: SiteResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = err.exception;
          }
        })
      }
    });
  }
}
