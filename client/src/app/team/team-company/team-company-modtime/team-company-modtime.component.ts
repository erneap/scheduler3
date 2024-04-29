import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ListItem } from 'src/app/generic/button-list/listitem';
import { DeletionConfirmationComponent } from 'src/app/generic/deletion-confirmation/deletion-confirmation.component';
import { Company, ICompany, ModPeriod } from 'src/app/models/teams/company';
import { ITeam, Team } from 'src/app/models/teams/team';
import { SiteResponse } from 'src/app/models/web/siteWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-team-company-modtime',
  templateUrl: './team-company-modtime.component.html',
  styleUrls: ['./team-company-modtime.component.scss']
})
export class TeamCompanyModtimeComponent {
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
    this.setPeriods();
  }
  get company(): Company {
    if (this._company) {
      return this._company;
    }
    return new Company();
  }
  @Output() teamChanged = new EventEmitter<Team>();
  periods: ListItem[] = [];
  selected: ModPeriod;
  modForm: FormGroup;
  minYear: number;
  dupKeyError: boolean = false;

  constructor(
    protected teamService: TeamService,
    protected dialogService: DialogService,
    protected authService: AuthService,
    protected dialog: MatDialog,
    private fb: FormBuilder
  ) {
    const now = new Date();
    this.minYear = now.getFullYear();
    this.modForm = this.fb.group({
      year: [now.getFullYear(), [Validators.required, 
        Validators.min(now.getFullYear())]],
      start: [now, [Validators.required]],
      end: [now, [Validators.required]],
    });
    this.selected = new ModPeriod();
    this.selected.year = 0;
    this.onSelect(`${this.selected.year}`);
  }

  setPeriods() {
    this.periods = [];
    this.periods.push(new ListItem('0', 'Add New Mod Period'))
    this.company.modperiods.sort((a,b) => a.compareTo(b));
    this.company.modperiods.forEach(mp => {
      this.periods.push(new ListItem(`${mp.year}`, `${mp.year}`));
    })
  }

  getButtonClass(id: string) {
    let answer = 'employee';
    if (`${this.selected.year}` === id) {
      answer += ' active';
    }
    return answer;
  }

  onSelect(id: string) {
    if (id === '0') {
      this.selected = new ModPeriod();
      this.selected.year = 0;
    } else {
      const year = Number(id);
      this.company.modperiods.forEach(mp => {
        if (mp.year === year) {
          this.selected = new ModPeriod(mp);
        }
      })
    }
    this.setModPeriod();
  }

  setModPeriod() {
    const now = new Date();
    if (this.selected.year === 0) {
      this.modForm.controls['year'].setValue(now.getFullYear());
      this.modForm.controls['start'].setValue(now);
      this.modForm.controls['end'].setValue(now);
      this.modForm.controls['year'].enable()
      this.dupKeyError = false;
    } else {
      this.modForm.controls['year'].setValue(this.selected.year);
      this.modForm.controls['start'].setValue(this.selected.start);
      this.modForm.controls['end'].setValue(this.selected.end);
      this.modForm.controls['year'].disable();
      this.dupKeyError = false;
    }
  }

  dateString(value: Date): string {
      let chg = `${value.getFullYear()}-`
      if (value.getMonth() < 9) {
        chg += "0";
      }
      chg += `${value.getMonth() + 1}-`;
      if (value.getDate() < 10) {
        chg += "0";
      }
      chg += `${value.getDate()}`;
      return chg;
  }

  onAdd() {
    const now = new Date();
    if (this.modForm.valid) {
      const year = this.modForm.value.year;
      const start = new Date(this.modForm.value.start);
      const end = new Date(this.modForm.value.end);
      let found = (now.getFullYear() > year);
      this.company.modperiods.forEach(mod => {
        if (mod.year === year) {
          found = true;
        }
      });
      if (!found) {
        this.dupKeyError = false;
        const value = `${year}|${this.dateString(start)}|${this.dateString(end)}`;
        this.teamService.updateTeamCompany(this.team.id, this.company.id,
          "addmod", value).subscribe({
          next: (data: SiteResponse) => {
            this.dialogService.closeSpinner();
            if (data && data != null && data.team) {
                this.team = data.team;
              this.teamService.setTeam(data.team);
              this.team.companies.forEach(co => {
                if (co.id === this.company.id) {
                  this.company = co;
                  this.company.modperiods.forEach(mod => {
                    if (mod.year === year) {
                      this.selected = new ModPeriod(mod);
                      this.modForm.controls[year].disable();
                    }
                  });
                  this.setPeriods()
                }
              });
              this.teamChanged.emit(new Team(data.team));
            }
            this.authService.statusMessage = "Addition complete";
          },
          error: (err: SiteResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = err.exception;
          }
        });

      } else {
        this.dupKeyError = true;
      }
    }
  }

  onUpdate(field: string) {
    if (this.selected.year > 0) {
      const value = new Date(this.modForm.controls[field].value);
      const chg = `${field}|${this.selected.year}|${this.dateString(value)}`;
      this.teamService.updateTeamCompany(this.team.id, this.company.id, 
        "updatemod", chg).subscribe({
        next: (data: SiteResponse) => {
          this.dialogService.closeSpinner();
          if (data && data != null && data.team) {
             this.team = data.team;
            this.teamService.setTeam(data.team);
            this.team.companies.forEach(co => {
              if (co.id === this.company.id) {
                this.company = co;
                this.company.modperiods.forEach(mod => {
                  if (mod.year === this.selected.year) {
                    this.selected = new ModPeriod(mod);
                  }
                });
              }
            });
            this.teamChanged.emit(new Team(data.team));
          }
          this.authService.statusMessage = "Addition complete";
        },
        error: (err: SiteResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      });
    } else if (field.toLowerCase() === 'start') {
      const start = new Date(this.modForm.value.start);
      const end = new Date(this.modForm.value.end);
      if (end.getTime() < start.getTime()) {
        this.modForm.controls['end'].setValue(start);
      }
    }
  }

  onDelete() {
    const dialogRef = this.dialog.open(DeletionConfirmationComponent, {
      data: {title: 'Confirm Company Mod Period Deletion', 
      message: 'Are you sure you want to delete this Company Mod Period?'},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.authService.statusMessage = "Delete team company mod period";
        this.dialogService.showSpinner();
        this.teamService.updateTeamCompany(this.team.id, this.company.id, 
          "delmod", `${this.selected.year}`).subscribe({
          next: (data: SiteResponse) => {
            this.dialogService.closeSpinner();
            if (data && data != null && data.team) {
              this.team = data.team;
              this.teamService.setTeam(data.team);
              if (this.team.companies) {
                this.team.companies.forEach(co => {
                  if (co.id === this.company.id) {
                    this.company = new Company(co);
                    this.selected = new ModPeriod();
                    this.selected.year = 0;
                    this.setPeriods();
                  }
                });
              }
              this.teamChanged.emit(new Team(data.team));
            }
            this.authService.statusMessage = "deletion complete";
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
