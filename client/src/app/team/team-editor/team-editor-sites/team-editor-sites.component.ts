import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ListItem } from 'src/app/generic/button-list/listitem';
import { Site } from 'src/app/models/sites/site';
import { ITeam, Team } from 'src/app/models/teams/team';
import { AppStateService } from 'src/app/services/app-state.service';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-team-editor-sites',
  templateUrl: './team-editor-sites.component.html',
  styleUrl: './team-editor-sites.component.scss'
})
export class TeamEditorSitesComponent {
  private _team: Team = new Team();
  @Input()
  public set team(t: ITeam) {
    this._team = new Team(t);
    this.setSites();
  }
  get team(): Team {
    return this._team;
  }
  @Input() width: number = 1000;
  @Input() height: number = 1000;
  @Output() changed = new EventEmitter<Team>();

  sites: ListItem[] = [];
  selected: Site = new Site();

  constructor(
    protected authService: AuthService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected dialogService: DialogService,
    protected appState: AppStateService
  ) {
    const iteam = this.teamService.getTeam();
    if (iteam) {
      this.team = iteam;
    }
    this.width = this.appState.viewWidth;
    this.height = this.appState.viewHeight - 150;
  }

  setSites() {
    this.sites = [];
    this.sites.push(new ListItem('new', 'Add New Site'));
    this.team.sites.sort((a,b) => a.compareTo(b));
    this.team.sites.forEach(site => {
      this.sites.push(new ListItem(site.id, site.name));
    });
  }

  viewStyle(): string {
    return `width: ${this.width}px;height: ${this.height}px;`;
  }

  itemClass(id: string): string {
    if ((id.toLowerCase() === 'new' && (this.selected.id.toLowerCase() === '' 
      || this.selected.id.toLowerCase() === 'new')) 
      || id.toLowerCase() === this.selected.id.toLowerCase()) {
      return 'item selected'
    }
    return 'item';
  }

  tabGroupStyle(): string {
    return `width: ${this.width - 205}px;`;
  }

  onSelect(id: string) {
    if (id.toLowerCase() === 'new' || id === '') {
      this.selected = new Site();
    } else {
      this.team.sites.forEach(s => {
        if (s.id.toLowerCase() === id.toLowerCase()) {
          this.selected = new Site(s);
        }
      });
    }
  }

  onSiteChange(site: Site) {
    let found = false;
    for (let i=0; i < this.team.sites.length && !found; i++) {
      if (this.team.sites[i].id.toLowerCase() === site.id.toLowerCase()) {
        found = true;
        this.team.sites[i] = new Site(site);
      }
    }
    this.changed.emit(this.team);
  }
}
