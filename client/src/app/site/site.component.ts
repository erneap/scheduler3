import { Component, Input } from '@angular/core';
import { ISite, Site } from '../models/sites/site';
import { SiteResponse } from '../models/web/siteWeb';
import { AuthService } from '../services/auth.service';
import { DialogService } from '../services/dialog-service.service';
import { SiteService } from '../services/site.service';
import { TeamService } from '../services/team.service';

@Component({
  selector: 'app-site',
  templateUrl: './site.component.html',
  styleUrls: ['./site.component.scss']
})
export class SiteComponent {
  private _site: Site = new Site();
  @Input()
  public set site(id: ISite) {
    this._site = new Site(id);
  }
  get site(): Site {
    return this._site;
  }

  constructor(
    protected authService: AuthService,
    protected dialogService: DialogService,
    protected siteService: SiteService,
    protected teamService: TeamService
  ) { 
    const iSite = this.siteService.getSite();
    if (iSite) {
      this.site = iSite;
    }
  }

  onChangedSite(iSite: ISite) {
    this.site = iSite;
  }
}
