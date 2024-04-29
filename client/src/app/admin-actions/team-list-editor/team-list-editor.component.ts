import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ListItem } from 'src/app/generic/button-list/listitem';
import { DeletionConfirmationComponent } from 'src/app/generic/deletion-confirmation/deletion-confirmation.component';
import { Team } from 'src/app/models/teams/team';
import { TeamsResponse } from 'src/app/models/web/teamWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-team-list-editor',
  templateUrl: './team-list-editor.component.html',
  styleUrls: ['./team-list-editor.component.scss']
})
export class TeamListEditorComponent {
  teams: Team[] = [];
  teamList: ListItem[] = [];
  selected: string = 'new';
  team: Team = new Team();

  constructor(
    protected authService: AuthService,
    protected dialogService: DialogService,
    protected teamService: TeamService,
    protected dialog: MatDialog
  ) { 
    this.getTeams();
  }

  getButtonClass(id: string): string {
    let answer = 'employee';
    if (id.toLowerCase() === this.selected.toLowerCase()) {
      answer += " selected";
    } else {
      answer += " active";
    }
    return answer;
  }

  getTeams() {
    this.teams = [];
    this.authService.statusMessage = "Retrieve all teams";
    this.dialogService.showSpinner();
    this.teamService.getTeams().subscribe({
      next: (data: TeamsResponse) => {
        this.dialogService.closeSpinner();
        this.authService.statusMessage = "Retrieval Complete";
        this.teams = [];
        if (data && data != null && data.teams) {
          data.teams.forEach(tm => {
            this.teams.push(new Team(tm));
          });
          this.teams.sort((a,b) => a.compareTo(b));
          this.setTeamsList();
        }
      },
      error: err => {
        this.dialogService.closeSpinner();
        this.authService.statusMessage = err.message;
      }
    });
  }

  setTeamsList() {
    this.teamList = [];
    this.teamList.push(new ListItem('new', 'Add New Team'));
    this.teams.forEach(tm => {
      this.teamList.push(new ListItem(tm.id, tm.name));
    });
  }

  changed(team: Team) {
    let found = false;
    for (let i=0; i < this.teams.length && !found; i++) {
      if (this.teams[i].id === team.id) {
        found = true;
        this.teams[i] = new Team(team);
      }
    }
    if (!found) {
      this.selected = team.id;
      this.teams.push(new Team(team));
      this.teams.sort((a,b) => a.compareTo(b));
    }
    this.setTeamsList();
  }

  onSelect(id: string) {
    this.selected = id;
    if (id.toLowerCase() === 'new') {
      this.team = new Team();
    } else {
      this.teams.forEach(tm => {
        if (tm.id === id) {
          this.team = new Team(tm);
        }
      });
    }
  }

  onDelete() {
    const dialogRef = this.dialog.open(DeletionConfirmationComponent, {
      data: {title: 'Confirm Team Deletion', 
      message: 'Are you sure you want to delete selected team, along '
        + 'with all associated employees?'},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.authService.statusMessage = "Deleting Team";
        this.dialogService.showSpinner();
        this.teamService.deleteTeam(this.selected).subscribe({
          next: (data: TeamsResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = "Deletion Complete";
            this.selected = 'new';
            this.teams = [];
            if (data && data != null && data.teams) {
              data.teams.forEach(tm => {
                this.teams.push(new Team(tm));
              });
              this.teams.sort((a,b) => a.compareTo(b));
              this.setTeamsList();
            }
          },
          error: err => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = err.message;
          }
        });
      }
    });
  }
}
