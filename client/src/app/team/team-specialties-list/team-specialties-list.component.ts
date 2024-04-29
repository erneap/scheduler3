import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ListItem } from 'src/app/generic/button-list/listitem';
import { DeletionConfirmationComponent } from 'src/app/generic/deletion-confirmation/deletion-confirmation.component';
import { ITeam, Team } from 'src/app/models/teams/team';
import { SiteResponse } from 'src/app/models/web/siteWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-team-specialties-list',
  templateUrl: './team-specialties-list.component.html',
  styleUrls: ['./team-specialties-list.component.scss']
})
export class TeamSpecialtiesListComponent {
  private _team: Team | undefined;
  @Input()
  public set team(tm: ITeam | undefined) {
    this._team = new Team(tm);
    this.teamid = this._team.id;
    this.setSpecialties();
  }
  get team(): Team | undefined {
    return this._team;
  }
  specialties: ListItem[] = [];
  contactForm: FormGroup;
  teamid: string = "";
  selectedId: string = '0';
  showSortUp: boolean = false;
  showSortDown: boolean = false;
  showDelete: boolean = false;
  buttonText: string = "Add";

  constructor(
    protected teamService: TeamService,
    protected dialogService: DialogService,
    protected authService: AuthService,
    protected dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required]],
    });
    this.setSpecialties();
  }

  setSpecialties() {
    this.specialties = [];
    this.specialties.push(new ListItem('0', "Add New Specialty"));
    const nid = Number(this.selectedId);
    this.showSortUp = false;
    this.showSortDown = false;
    this.showDelete = (this.selectedId !== '0');
    if (!this.team) {
      const team = this.teamService.getTeam();
      if (team) {
        this.team = team;
      }
    }
    if (this.team) {
      this.team.specialties.sort((a,b)  => a.compareTo(b));
      this.team.specialties.forEach(ct => {
        this.specialties.push(new ListItem(`${ct.id}`, ct.name));
      });
    }
    if (this.team && nid > 0) {
      for (let i=0; i < this.team.specialties.length; i++) {
        if (this.team.specialties[i].id === nid) {
          this.showSortUp =  !(i === 0);
          this.showSortDown =  !(i === this.team.specialties.length - 1);
          this.contactForm.controls['name']
            .setValue(this.team.specialties[i].name);
          this.buttonText = "Update";
        }
      }
    } else {
      this.contactForm.controls['name'].setValue('');
      this.buttonText = "Add";
    }
  }

  onSelect(id: string) {
    this.selectedId = id;
    this.setSpecialties();
  }

  onChangeSort(direction: string) {
    this.dialogService.showSpinner();
    this.authService.statusMessage = "Changing Sort";
    const id = Number(this.selectedId);
    const field = 'sort';
    this.teamService.updateSpecialtyType(this.teamid, id, field, direction)
    .subscribe({
      next: (resp: SiteResponse) => {
        this.dialogService.closeSpinner();
        this.team = resp.team;
        if (resp.team) {
          this.teamService.setTeam(resp.team);
        }
        this.setSpecialties();
      },
      error: (err: SiteResponse) => {
        this.dialogService.closeSpinner();
        this.authService.statusMessage = err.exception;
      }
    });
  }

  onDelete() {
    const dialogRef = this.dialog.open(DeletionConfirmationComponent, {
      data: {title: 'Confirm Specialty Deletion', 
      message: 'Are you sure you want to delete this specialty?'},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.authService.statusMessage = "Delete specialty";
        this.dialogService.showSpinner();
        this.teamService.deleteSpecialtyType(this.teamid, Number(this.selectedId))
        .subscribe({
          next: (resp: SiteResponse) => {
            this.dialogService.closeSpinner();
            this.team = resp.team;
            if (resp.team) {
              this.teamService.setTeam(resp.team);
            }
            this.selectedId = '0';
            this.setSpecialties();
          },
          error: (err: SiteResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = err.exception;
          }
        });
      }
    });
  }

  getButtonStyle(id: string): string {
    if (id.toLowerCase() === this.selectedId.toLowerCase()) {
      return "employee active";
    }
    return "employee";
  }

  addContactType() {
    this.dialogService.showSpinner();
    this.authService.statusMessage = "Adding Specialty Type";
    const id = Number(this.selectedId);
    console.log(`${id} = ${this.contactForm.value.name}`);
    this.teamService.addSpecialtyType(this.teamid, id, this.contactForm.value.name)
    .subscribe({
      next: (resp: SiteResponse) => {
        this.dialogService.closeSpinner();
        this.team = resp.team;
        if (resp.team) {
          this.teamService.setTeam(resp.team);
        }
        this.setSpecialties();
      },
      error: (err: SiteResponse) => {
        this.dialogService.closeSpinner();
        this.authService.statusMessage = err.exception;
      }
    });
  }
}
