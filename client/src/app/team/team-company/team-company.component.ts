import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ListItem } from 'src/app/generic/button-list/listitem';
import { DeletionConfirmationComponent } from 'src/app/generic/deletion-confirmation/deletion-confirmation.component';
import { Company } from 'src/app/models/teams/company';
import { ITeam, Team } from 'src/app/models/teams/team';
import { SiteResponse } from 'src/app/models/web/siteWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-team-company',
  templateUrl: './team-company.component.html',
  styleUrls: ['./team-company.component.scss']
})
export class TeamCompanyComponent {
  private _team: Team = new Team();
  @Input()
  public set team(iTeam: ITeam) {
    this._team = new Team(iTeam);
    this.setCompanies();
  }
  get team(): Team {
    return this._team;
  }
  @Output() teamChanged = new EventEmitter<Team>();
  companies: ListItem[] = [];
  selected: string = 'new';
  companyForm: FormGroup;
  company?: Company;
  hasHolidays: boolean = false;
  showModTime: boolean = false;
  showIngestStart: boolean = false;
  weekdays: string[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday",
    "Friday", "Saturday"];

  constructor(
    protected authService: AuthService,
    protected dialogService: DialogService,
    protected teamService: TeamService,
    protected dialog: MatDialog,
    private fb: FormBuilder
  ) { 
    const iTeam = this.teamService.getTeam();
    if (iTeam) {
      this.team = iTeam;
    }
    this.companyForm = this.fb.group({
      id: ['', [Validators.required, Validators.pattern("^[a-z0-9]+")]],
      name: ['', [Validators.required]],
      ingest: ['manual', [Validators.required]],
      period: "7",
      start: "6",
      holidays: false,
      modtime: false,
    })
  }

  setCompanies() {
    this.companies = [];
    this.companies.push(new ListItem('new', 'Add New Company'));
    if (this.team.companies) {
      this.team.companies.forEach(co => {
        this.companies.push(new ListItem(co.id, co.name));
      });
    }
  }

  getButtonClass(id: string): string {
    let answer = 'employee';
    if (id === this.selected) {
      answer += ' active';
    }
    return answer;
  }

  onSelect(id: string) {
    this.selected = id;
    this.company = undefined;
    this.hasHolidays = false;
    if (this.team.companies) {
      this.team.companies.forEach(co => {
        if (co.id === id) {
          this.company = new Company(co);
          this.hasHolidays = this.company.holidays.length > 0;
          this.showModTime = this.company.modperiods.length > 0;
        }
      });
    }
    this.setCompany();
  }

  setCompany() {
    if (this.company) {
      this.companyForm.controls['id'].setValue(this.company.id);
      this.companyForm.controls['name'].setValue(this.company.name);
      this.companyForm.controls['ingest'].setValue(this.company.ingest);
      if (this.company.ingestPeriod) {
        this.companyForm.controls['period'].setValue(`${this.company.ingestPeriod}`);
        const nPeriod = Number(this.company.ingestPeriod);
        this.showIngestStart = nPeriod < 15;
      } else {
        this.showIngestStart = false;
        this.companyForm.controls['period'].setValue('30');
      }
      if (this.company.startDay) {
        this.companyForm.controls["start"].setValue(this.company.startDay);
      } else {
        this.companyForm.controls["start"].setValue(0);
      }
      this.companyForm.controls['holidays'].setValue(this.company.holidays.length > 0);
      this.companyForm.controls['modtime'].setValue(this.company.modperiods.length > 0);
    } else {
      this.companyForm.controls['id'].setValue('');
      this.companyForm.controls['name'].setValue('');
      this.companyForm.controls['ingest'].setValue('manual');
      this.companyForm.controls['period'].setValue('30');
      this.companyForm.controls["start"].setValue(`6`);
      this.companyForm.controls['holidays'].setValue(false);
      this.companyForm.controls['modtime'].setValue(false);
    }
  }

  onAdd() {
    if (this.companyForm.valid) {
      this.authService.statusMessage = "Adding new company";
      this.dialogService.showSpinner();
      const id = this.companyForm.value.id;
      this.teamService.addTeamCompany(this.team.id, id, 
        this.companyForm.value.name, this.companyForm.value.ingest).subscribe({
        next: (data: SiteResponse) => {
          this.dialogService.closeSpinner();
          if (data && data != null && data.team) {
            this.selected = id;
            this.team = data.team;
            this.teamService.setTeam(data.team);
            this.teamChanged.emit(new Team(data.team));
            this.setCompany();
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

  onDelete() {
    const dialogRef = this.dialog.open(DeletionConfirmationComponent, {
      data: {title: 'Confirm Company Deletion', 
      message: 'Are you sure you want to delete this Company?'},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.authService.statusMessage = "Delete team company";
        this.dialogService.showSpinner();
        this.teamService.deleteTeamCompany(this.team.id, this.selected)
        .subscribe({
          next: (data: SiteResponse) => {
            this.dialogService.closeSpinner();
            this.selected = 'new';
            if (data && data != null && data.team) {
              this.selected = 'new';
              this.company = undefined;
              this.team = data.team;
              this.teamService.setTeam(data.team);
              this.teamChanged.emit(new Team(data.team));
              this.setCompany();
            }
            this.authService.statusMessage = "Deletion complete"
          },
          error: (err: SiteResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = err.exception;
          }
        });
      }
    });
  }

  onUpdate(field: string) {
    if (field === 'period') {
      const nPeriod = Number(this.companyForm.controls[field].value);
      this.showIngestStart = nPeriod < 15;
    }
    if (this.selected !== 'new' && this.companyForm.controls[field].valid) {
      const value = this.companyForm.controls[field].value;
      switch (field.toLowerCase()) {
        case 'holidays':
          this.hasHolidays = value;
          break;
        case 'modtime':
          this.showModTime = value;
          break;
        default:
          this.authService.statusMessage = "Updating Team Company";
          this.dialogService.showSpinner();
          this.teamService.updateTeamCompany(this.team.id, this.selected, field,
            value).subscribe({
            next: (data: SiteResponse) => {
              this.dialogService.closeSpinner();
              if (data && data != null && data.team) {
                this.team = data.team;
                this.teamService.setTeam(data.team);
                this.teamChanged.emit(new Team(data.team));
              }
              this.authService.statusMessage = "Update complete";
            },
            error: (err: SiteResponse) => {
              this.dialogService.closeSpinner();
              this.authService.statusMessage = err.exception;
            }
          });
          break;
      }
    }
  }
}
