import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactType } from 'src/app/models/teams/contacttype';
import { ITeam, Team } from 'src/app/models/teams/team';
import { SiteResponse } from 'src/app/models/web/siteWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { TeamService } from 'src/app/services/team.service';
import { ListItem } from 'src/app/generic/button-list/listitem';
import { MatDialog } from '@angular/material/dialog';
import { DeletionConfirmationComponent } from 'src/app/generic/deletion-confirmation/deletion-confirmation.component';

@Component({
  selector: 'app-team-contact-list',
  templateUrl: './team-contact-list.component.html',
  styleUrls: ['./team-contact-list.component.scss']
})
export class TeamContactListComponent {
  private _team: Team | undefined;
  @Input()
  public set team(tm: ITeam | undefined) {
    this._team = new Team(tm);
    this.teamid = this._team.id;
    this.setContactTypes();
  }
  get team(): Team | undefined {
    return this._team;
  }
  contactTypes: ListItem[] = [];
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
    this.setContactTypes();
  }

  setContactTypes() {
    this.contactTypes = [];
    this.contactTypes.push(new ListItem('0', "Add New Contact Type"));
    const nid = Number(this.selectedId);
    this.showSortUp = false;
    this.showSortDown = false;
    this.showDelete = (this.selectedId !== '0');
    if (!this.team) {
      const team = this.teamService.getTeam();
      if (team) {
        this.team = team;
      }
    } else {
      this.team.contacttypes.sort((a,b)  => a.compareTo(b));
      this.team.contacttypes.forEach(ct => {
        this.contactTypes.push(new ListItem(`${ct.id}`, ct.name));
      });
    }
    if (this.team && nid > 0) {
      for (let i=0; i < this.team.contacttypes.length; i++) {
        if (this.team.contacttypes[i].id === nid) {
          this.showSortUp =  !(i === 0);
          this.showSortDown =  !(i === this.team.contacttypes.length - 1);
          this.contactForm.controls['name']
            .setValue(this.team.contacttypes[i].name);
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
    this.setContactTypes();
  }

  onChangeSort(direction: string) {
    this.dialogService.showSpinner();
    this.authService.statusMessage = "Changing Sort";
    const id = Number(this.selectedId);
    const field = 'sort';
    this.teamService.updateContactType(this.teamid, id, field, direction)
    .subscribe({
      next: (resp: SiteResponse) => {
        this.dialogService.closeSpinner();
        this.team = resp.team;
        if (resp.team) {
          this.teamService.setTeam(resp.team);
        }
        this.setContactTypes();
      },
      error: (err: SiteResponse) => {
        this.dialogService.closeSpinner();
        this.authService.statusMessage = err.exception;
      }
    });
  }

  onDelete() {
    const dialogRef = this.dialog.open(DeletionConfirmationComponent, {
      data: {title: 'Confirm Contact Type Deletion', 
      message: 'Are you sure you want to delete this contact type?'},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.authService.statusMessage = "Delete contact type";
        this.dialogService.showSpinner();
        this.teamService.deleteContactType(this.teamid, Number(this.selectedId))
        .subscribe({
          next: (resp: SiteResponse) => {
            this.dialogService.closeSpinner();
            this.team = resp.team;
            if (resp.team) {
              this.teamService.setTeam(resp.team);
            }
            this.selectedId = '0';
            this.setContactTypes();
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
    this.authService.statusMessage = "Adding Contact Type";
    const id = Number(this.selectedId);
    console.log(`${id} = ${this.contactForm.value.name}`);
    this.teamService.addContactType(this.teamid, id, this.contactForm.value.name)
    .subscribe({
      next: (resp: SiteResponse) => {
        this.dialogService.closeSpinner();
        this.team = resp.team;
        if (resp.team) {
          this.teamService.setTeam(resp.team);
        }
        this.setContactTypes();
      },
      error: (err: SiteResponse) => {
        this.dialogService.closeSpinner();
        this.authService.statusMessage = err.exception;
      }
    });
  }
}
