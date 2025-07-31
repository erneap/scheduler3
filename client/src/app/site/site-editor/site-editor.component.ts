import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ISite, Site } from 'src/app/models/sites/site';
import { Team } from 'src/app/models/teams/team';
import { SiteResponse } from 'src/app/models/web/siteWeb';
import { AppStateService } from 'src/app/services/app-state.service';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
    selector: 'app-site-editor',
    templateUrl: './site-editor.component.html',
    styleUrls: ['./site-editor.component.scss'],
    standalone: false
})
export class SiteEditorComponent {
  private _site: Site = new Site();
  @Input()
  public set site(s: ISite) {
    this._site = new Site(s);
    this.setSite();
  }
  get site(): Site {
    return this._site;
  }
  @Input() team: Team = new Team();
  @Input() width: number = 1048;
  @Input() height: number = 1000;
  @Output() changed = new EventEmitter<Site>();

  siteform: FormGroup;

  constructor(
    protected authService: AuthService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected stateService: AppStateService,
    protected dialogService: DialogService,
    private fb: FormBuilder
  ) {
    this.width = this.stateService.viewWidth;
      - (this.stateService.showMenu ? 270 : 20);
    this.height = this.stateService.viewHeight - 100;
    const isite = this.siteService.getSite();
    if (isite) {
      this._site = new Site(isite);
    }
    const iteam = this.teamService.getTeam();
    if (iteam) {
      this.team = new Team(iteam);
    }
    this.siteform = this.fb.group({
      name: ['', [Validators.required]],
      offset: [0, [Validators.min(-12), Validators.max(12)]]
    });
    this.setSite();
  }

  setSite() {
    this.siteform.controls['name'].setValue(this.site.name);
    this.siteform.controls['offset'].setValue(this.site.utcOffset);
  }

  setViewStyle(): string {
    return `width: ${this.width - 20}px;`;
  }

  updateSite(field: string) {
    const fieldValue = `${this.siteform.controls[field].value}`;
    this.dialogService.showSpinner();
    this.siteService.UpdateSite(this.team.id, this.site.id, field, fieldValue)
    .subscribe({
      next: (resp: SiteResponse) => {
        this.dialogService.closeSpinner();
        if (resp && resp !== null && resp.site) {
          this.site = resp.site;
          this.siteChanged(this.site);
        }
      },
      error: (err: SiteResponse) => {
        this.dialogService.closeSpinner();
        this.authService.statusMessage = `Error: ${err.exception}`;
      }
    });
  }

  siteChanged(newsite: Site) {
    const iSite = this.siteService.getSite();
    if (iSite && iSite.id === newsite.id) {
      this.siteService.setSite(new Site(newsite));
    } 

    const iTeam = this.teamService.getTeam();
    if (iTeam) {
      const team = new Team(iTeam);
      if (team.sites) {
        let found = false;
        for (let i=0; i < team.sites.length && !found; i++) {
          if (team.sites[i].id === newsite.id) {
            team.sites[i] = new Site(newsite);
            found = true;
          }
        }
      }
      this.teamService.setTeam(team);
    }
  }
}
