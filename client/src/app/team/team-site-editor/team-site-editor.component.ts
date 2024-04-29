import { Component } from '@angular/core';
import { ListItem } from 'src/app/generic/button-list/listitem';
import { ISite, Site } from 'src/app/models/sites/site';
import { Team } from 'src/app/models/teams/team';
import { SiteResponse } from 'src/app/models/web/siteWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-team-site-editor',
  templateUrl: './team-site-editor.component.html',
  styleUrls: ['./team-site-editor.component.scss']
})
export class TeamSiteEditorComponent {
  team: Team;
  selected: string = 'new';
  site: Site;
  sites: ListItem[] = [];

  constructor(
    protected authService: AuthService,
    protected dialogService: DialogService,
    protected siteService: SiteService,
    protected teamService: TeamService
  ) {
    const iTeam = this.teamService.getTeam();
    if (iTeam) {
      this.team = new Team(iTeam);
    } else {
      this.team = new Team();
    }
    this.setSites();
    const iSite = this.siteService.getSite();
    if (iSite) {
      this.site = new Site(iSite);
      this.selected = this.site.id;
    } else {
      this.site = new Site();
    }
  }

  setSites() {
    this.sites = [];
    this.sites.push(new ListItem('new', 'Add New Site'))
    if (this.team.sites) {
      this.team.sites = this.team.sites.sort((a,b) => a.compareTo(b));
      this.team.sites.forEach(iSite => {
        this.sites.push(new ListItem(iSite.id, iSite.name));
      });
    }
  }

  onSelect(id: string) {
    this.selected = id;
   this.authService.statusMessage = "Retrieving requested site";
    this.dialogService.showSpinner();
    this.teamService.retrieveSelectedSite(this.team.id, this.selected).subscribe({
      next: (data: SiteResponse) => {
        this.dialogService.closeSpinner();
        if (data && data != null && data.site) {
          this.site = new Site(data.site);
          this.teamService.setSelectedSite(data.site)
        }
        this.authService.statusMessage = "Retrieval complete"
      },
      error: (err: SiteResponse) => {
        this.dialogService.closeSpinner();
        this.authService.statusMessage = err.exception;
      }
    });
  }

  getButtonClass(id: string) {
    let answer = 'employee';
    if (this.selected.toLowerCase() === id.toLowerCase()) {
      answer += ' active';
    }
    return answer;
  }

  onAdd(site: ISite) {
    const newSite = new Site(site);
    let found = false;
    for (let i=0; i < this.team.sites.length && !found; i++) {
      if (this.team.sites[i].id === newSite.id) {
        this.team.sites[i] = newSite;
        found = true;
      }
    }
    if (!found) {
      this.team.sites.push(newSite);
    }
    this.teamService.setTeam(this.team);
    this.setSites();
  }
}
