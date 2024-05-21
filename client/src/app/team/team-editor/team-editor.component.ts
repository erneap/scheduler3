import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ITeam, Team } from 'src/app/models/teams/team';
import { SiteResponse } from 'src/app/models/web/siteWeb';
import { AppStateService } from 'src/app/services/app-state.service';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-team-editor',
  templateUrl: './team-editor.component.html',
  styleUrls: ['./team-editor.component.scss']
})
export class TeamEditorComponent {
  @Input() width: number = 1200;
  @Input() height: number = 1200;
  private _team: Team = new Team();
  @Input()
  public set team(t: ITeam) {
    this._team = new Team(t);
    this.setTeam();
  }
  get team(): Team {
    return this._team;
  }
  @Output() changed = new EventEmitter<Team>();
  teamForm: FormGroup;


  constructor(
    protected authService: AuthService,
    protected teamService: TeamService,
    protected dialogService: DialogService,
    protected stateService: AppStateService,
    private fb: FormBuilder
  ) {
    this.teamForm = this.fb.group({
      name: ['', [Validators.required]],
    });
    const iTeam = this.teamService.getTeam();
    if (iTeam) {
      this.team = iTeam;
    }
    this.width = this.stateService.viewWidth - 45;
    this.height = this.stateService.viewHeight - 150;
  }

  setTeam() {
    this.teamForm.controls['name'].setValue(this.team.name);
  }

  onChange(team: Team) {
    this.team = team;
    const iteam = this.teamService.getTeam();
    if (iteam && iteam.id === team.id) {
      this.teamService.setTeam(team);
    }
    this.changed.emit(this.team);
  }

  updateTeam() {
    const name = this.teamForm.value.name;
    this.dialogService.showSpinner();
    this.teamService.updateTeam(this.team.id, name).subscribe({
      next: (data: SiteResponse) => {
        this.dialogService.closeSpinner();
        if (data && data !== null && data.team) {
          this.team = data.team;
          this.changed.emit(this.team);
        }
      },
      error: (err: SiteResponse) => {
        this.dialogService.closeSpinner();
        this.authService.statusMessage = err.exception;
      }
    })
  }
}
