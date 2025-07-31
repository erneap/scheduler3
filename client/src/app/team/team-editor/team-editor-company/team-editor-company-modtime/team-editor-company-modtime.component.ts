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
    selector: 'app-team-editor-company-modtime',
    templateUrl: './team-editor-company-modtime.component.html',
    styleUrls: ['./team-editor-company-modtime.component.scss'],
    standalone: false
})
export class TeamEditorCompanyModtimeComponent {
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
    this.setModPeriods();
  }
  get company(): Company {
    return this._company;
  }
  @Input() width: number = 250;
  @Output() changed = new EventEmitter<Team>()
  modtimes: ListItem[] = [];
  selected: ModPeriod = new ModPeriod();
  modForm: FormGroup;
  error: string = '';

  constructor(
    protected authService: AuthService,
    protected teamService: TeamService,
    protected dialogService: DialogService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    const now = new Date();
    this.modForm = this.fb.group({
      year: [now.getUTCFullYear(), [Validators.required]],
      start: [now, [Validators.required]],
      end: [now, [Validators.required]],
    });
    this.setModPeriods();
  }

  setModPeriods() {
    this.modtimes = [];
    const now = new Date();
    this.modtimes.push(new ListItem('0', 'Add New Mod Period'));
    if (this.company.modperiods) {
      this.company.modperiods.forEach(mp => {
        const label = `${mp.year}`;
        this.modtimes.push(new ListItem(label, label));
        if (now.getUTCFullYear() === mp.year) {
          this.selected = new ModPeriod(mp);
          this.setModPeriod();
        }
      });
    }
  }

  listStyle(): string {
    let ratio = this.width / 250;
    if (ratio > 1.0) ratio = 1.0;
    const width = Math.floor(250 * ratio);
    const height = Math.floor(200 * ratio);
    return `width: ${width}px;height: ${height}px;`;
  }

  itemStyle(): string {
    let ratio = this.width / 250;
    if (ratio > 1.0) ratio = 1.0;
    const fontSize = ratio;
    const width = Math.floor(250 * ratio);
    const height = Math.floor(20 * ratio);
    return `width: ${width}px;height: ${height}px;font-size:${fontSize}rem;`;
  }

  itemClass(id: string): string {
    if (`${this.selected.year}` === id) {
      return 'item selected';
    }
    return 'item';
  }

  formStyle(): string {
    let ratio = this.width / 250;
    if (ratio > 1.0) ratio = 1.0;
    const fontSize = 0.8 * ratio;
    const width = Math.floor(124 * ratio);
    const height = Math.floor(20 * ratio);
    return `width: ${width}px;height: ${height}px;font-size:${fontSize}rem;`;
  }

  dateStyle(): string {
    let ratio = this.width / 250;
    if (ratio > 1.0) ratio = 1.0;
    const fontSize = 0.8 * ratio;
    const width = Math.floor(80 * ratio);
    return `width: ${width}px;font-size: ${fontSize}rem;border: none;`;
  }

  errorStyle(): string {
    let ratio = this.width / 250;
    if (ratio > 1.0) ratio = 1.0;
    const width = Math.floor(124 * ratio) * 2;
    return `width: ${width}px;`
  }

  onSelect(id: string) {
    this.error = '';
    this.selected = new ModPeriod();
    this.company.modperiods.forEach(mp => {
      if (`${mp.year}` === id) {
        this.selected = new ModPeriod(mp);
      }
    });
    this.setModPeriod();
  }

  setModPeriod() {
    this.modForm.controls['year'].setValue(this.selected.year);
    this.modForm.controls['start'].setValue(new Date(this.selected.start));
    this.modForm.controls['end'].setValue(new Date(this.selected.end));
  }

  dateString(value: Date): string {
      let chg = `${value.getUTCFullYear()}-`
      if (value.getUTCMonth() < 9) {
        chg += "0";
      }
      chg += `${value.getUTCMonth() + 1}-`;
      if (value.getUTCDate() < 10) {
        chg += "0";
      }
      chg += `${value.getUTCDate()}`;
      return chg;
  }

  onClear() {
    this.error = '';
    this.selected = new ModPeriod();
    this.setModPeriod();
  }

  onUpdate(field: string) {
    if (this.selected.year > 0) {
      const value = new Date(this.modForm.controls[field].value);
      this.error = '';
      if ((field.toLowerCase() === 'start' 
        && (value.getUTCFullYear() < this.selected.year - 1 
        || value.getUTCFullYear() > this.selected.year)) 
        || (field.toLowerCase() === 'end'
        && (value.getUTCFullYear() < this.selected.year
        || value.getUTCFullYear() > this.selected.year + 1))) {
        this.error = 'must be within year +/- one year';
      } 
      if (this.error === '') {
        const chg = `${field}|${this.selected.year}|${this.dateString(value)}`;
        this.dialogService.showSpinner();
        this.teamService.updateTeamCompany(this.team.id, this.company.id, 
          "updatemod", chg).subscribe({
          next: (data: SiteResponse) => {
            this.dialogService.closeSpinner();
            if (data && data != null && data.team) {
              this.team = data.team;
              this.team.companies.forEach(co => {
                if (co.id.toLowerCase() === this.company.id.toLowerCase()) {
                  this.company = new Company(co);
                  this.company.modperiods.forEach(mp => {
                    if (mp.year === this.selected.year) {
                      this.selected = new ModPeriod(mp);
                    }
                  });
                }
              });
              this.changed.emit(new Team(data.team));
            }
          },
          error: (err: SiteResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = err.exception;
          }
        });
      }
    } else if (field.toLowerCase() === 'start') {
      const start = new Date(this.modForm.value.start);
      const end = new Date(this.modForm.value.end);
      if (end.getTime() < start.getTime()) {
        this.modForm.controls['end'].setValue(start);
      }
    }
  }

  onAdd() {
    this.error = '';
    if (this.modForm.invalid) {
      if (this.modForm.controls['year'].hasError('required')) {
        this.error = 'year required'
      }
      if (this.modForm.controls['start'].hasError('required')) {
        if (this.error !== '') {
          this.error += ', ';
        }
        this.error += 'state date required'
      }
      if (this.modForm.controls['end'].hasError('required')) {
        if (this.error !== '') {
          this.error += ', ';
        }
        this.error = 'end date required';
      }
    } 
    if (this.error === '') {
      this.error = '';
      const year = this.modForm.value.year;
      const start = new Date(this.modForm.value.start);
      const end = new Date(this.modForm.value.end);
      const now = new Date();
      const beginTest = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0) 
        - (30 * 24 * 3600000));
      const endTest = new Date(Date.UTC(year, 11, 31, 0, 0, 0, 0) 
        + (30 * 24 * 3600000));
      this.company.modperiods.forEach(mp => {
        if (mp.year === year) {
          this.error = 'duplicate year';
        }
      });
      if (start.getTime() < beginTest.getTime()
        || start.getTime() > endTest.getTime()) {
        if (this.error !== '') {
          this.error += ', ';
        }
        this.error += 'start date outside acceptable';
      }
      if (end.getTime() < beginTest.getTime()
        || end.getTime() > endTest.getTime()) {
        if (this.error !== '') {
          this.error += ', ';
        }
        this.error += 'end date outside acceptable';
      }
      if (end.getTime() < start.getTime()) {
        if (this.error !== '') {
          this.error += ', ';
        }
        this.error += 'end date before start';
      }
      if (this.error === '') {
        const value = `${year}|${this.dateString(start)}|${this.dateString(end)}`;
        this.teamService.updateTeamCompany(this.team.id, this.company.id,
          "addmod", value).subscribe({
          next: (data: SiteResponse) => {
            this.dialogService.closeSpinner();
            if (data && data != null && data.team) {
              this.team = data.team;
              this.team.companies.forEach(co => {
                if (co.id.toLowerCase() === this.company.id.toLowerCase()) {
                  this.company = new Company(co);
                  this.company.modperiods.forEach(mp => {
                    if (mp.year === this.selected.year) {
                      this.selected = new ModPeriod(mp);
                    }
                  });
                }
              });
              this.changed.emit(new Team(data.team));
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
      data: {title: 'Confirm Company Mod Period Deletion', 
      message: 'Are you sure you want to delete this Company Mod Period?'},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.dialogService.showSpinner();
        this.teamService.updateTeamCompany(this.team.id, this.company.id, 
          "delmod", `${this.selected.year}`).subscribe({
          next: (data: SiteResponse) => {
            this.dialogService.closeSpinner();
            if (data && data != null && data.team) {
              this.team = data.team;
              this.team.companies.forEach(co => {
                if (co.id.toLowerCase() === this.company.id.toLowerCase()) {
                  this.company = new Company(co);
                  this.company.modperiods.forEach(mp => {
                    if (mp.year === this.selected.year) {
                      this.selected = new ModPeriod(mp);
                    }
                  });
                }
              });
              this.changed.emit(new Team(data.team));
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
}
