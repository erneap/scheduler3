import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ITeam, Team } from 'src/app/models/teams/team';
import { SiteResponse } from 'src/app/models/web/siteWeb';
import { AppStateService } from 'src/app/services/app-state.service';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-team-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent {
  private _team: Team;
  @Input()
  public set team(iTeam: ITeam) {
    this._team = new Team(iTeam);
    this.setTeam();
  }
  get team(): Team {
    return this._team;
  }
  @Output() changed = new EventEmitter<Team>();
  teamForm: FormGroup;

  constructor(
    protected authService: AuthService,
    protected dialogService: DialogService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected stateService: AppStateService,
    private fb: FormBuilder
  ) {
    this._team = new Team(this.teamService.getTeam());
    this.teamForm = this.fb.group({
      name: ['', [Validators.required]],
    });
    this.setTeam();
  }

  setTeam() {
    this.teamForm.controls['name'].setValue(this.team.name);
  }

  onUpdate() {
    this.authService.statusMessage = "Updating Team Name";
    this.dialogService.showSpinner();
    this.teamService.updateTeam(this.team.id, this.teamForm.value.name).subscribe({
      next: (data: SiteResponse) => {
        this.dialogService.closeSpinner();
        if (data && data != null && data.team) {
          this.team = data.team;
          const iTeam = this.teamService.getTeam();
          if (iTeam && data.team.id === iTeam.id) {
            this.teamService.setTeam(data.team);
            const iSite = this.siteService.getSite();
            if (iSite) {
              this.authService.setWebLabel(this.team.name, iSite.name,
                this.stateService.viewState);
            } else {
              this.authService.setWebLabel(this.team.name, '',
                this.stateService.viewState);
            }
          }
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
