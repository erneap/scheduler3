import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DeletionConfirmationComponent } from 'src/app/generic/deletion-confirmation/deletion-confirmation.component';
import { Team } from 'src/app/models/teams/team';
import { TeamsResponse } from 'src/app/models/web/teamWeb';
import { AppStateService } from 'src/app/services/app-state.service';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-admin-teams-editor',
  templateUrl: './admin-teams-editor.component.html',
  styleUrls: ['./admin-teams-editor.component.scss']
})
export class AdminTeamsEditorComponent {
  teams: Team[] = [];
  selectedTeam: Team = new Team();
  teamsForm: FormGroup;
  width: number = this.appState.viewWidth - 405;

  constructor(
    protected teamService: TeamService,
    protected dialogService: DialogService,
    protected authService: AuthService,
    protected appState: AppStateService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.teamsForm = this.fb.group({
      team: '',
    });
    this.dialogService.showSpinner();
    this.teamService.getTeams().subscribe({
      next: resp => {
        this.dialogService.closeSpinner();
        if (resp && resp.teams) {
          this.teams = [];
          resp.teams.forEach(tm => {
            this.teams.push(new Team(tm));
          });
          this.teams.sort((a,b) => a.compareTo(b));
        }
      },
      error: (err: TeamsResponse) => {
        this.dialogService.closeSpinner();
        this.authService.statusMessage = err.exception;
      }
    })
  }

  onSelect() {
    const teamid = this.teamsForm.value.team;
    this.selectedTeam = new Team();
    this.teams.forEach(tm => {
      if (tm.id === teamid) {
        this.selectedTeam = new Team(tm);
      }
    })
  }

  updateTeam(team: Team) {
    let found = false;
    for (let i=0; i > this.teams.length && !found; i++) {
      if (this.teams[i].id === team.id) {
        this.teams[i] = new Team(team);
        this.selectedTeam = new Team(team);
        found = true;
      }
    }
    if (!found) { // add new team
      this.teams.push(new Team(team));
      this.teams.sort((a,b) => a.compareTo(b));
      this.selectedTeam = new Team(team);
      this.teamsForm.controls['team'].setValue(team.id);
    }

  }

  onDelete() {
    const dialogRef = this.dialog.open(DeletionConfirmationComponent, {
      data: {title: 'Confirm Employee Deletion',
      message:  'Are you sure you want to delete this team?'},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.dialogService.showSpinner();
        this.teamService.deleteTeam(this.selectedTeam.id).subscribe({
          next: (data: TeamsResponse) => {
            this.dialogService.closeSpinner();
            if (data && data.teams) {
              this.teams = [];
              data.teams.forEach(tm => {
                this.teams.push(new Team(tm));
              });
              this.teams.sort((a,b) => a.compareTo(b));
              this.teamsForm.controls['team'].setValue('');
              this.selectedTeam = new Team();
            }
          },
          error: (err: TeamsResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = err.exception;
          }
        });
      }
    })
  }
}
