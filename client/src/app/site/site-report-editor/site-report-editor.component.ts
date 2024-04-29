import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ISite, Site } from 'src/app/models/sites/site';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-site-report-editor',
  templateUrl: './site-report-editor.component.html',
  styleUrls: ['./site-report-editor.component.scss']
})
export class SiteReportEditorComponent {
  private _site: Site = new Site();
  @Input()
  public set site(id: ISite) {
    this._site = new Site(id);
  }
  get site(): Site {
    return this._site;
  }
  @Output() siteChanged = new EventEmitter<Site>();

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
   this.siteChanged.emit(new Site(iSite))
  }
}
