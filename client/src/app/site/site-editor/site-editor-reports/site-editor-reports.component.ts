import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Site } from 'src/app/models/sites/site';
import { ITeam, Team } from 'src/app/models/teams/team';
import { AppStateService } from 'src/app/services/app-state.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-site-editor-reports',
  templateUrl: './site-editor-reports.component.html',
  styleUrls: ['./site-editor-reports.component.scss']
})
export class SiteEditorReportsComponent {
  @Input() team: Team = new Team();
  @Input() site: Site = new Site();
  @Input() width: number = 1048;
  @Output() changed = new EventEmitter<Site>();

  constructor(
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected stateService: AppStateService
  ) {
    const iteam = this.teamService.getTeam();
    if (iteam) {
      this.team = new Team(iteam);
    }
    const isite = this.siteService.getSite();
    if (isite) {
      this.site = new Site(isite);
    }
    let width = this.stateService.viewWidth;
    if (this.stateService.showMenu) {
      width -= 250;
    }
    this.width = width;
  }

  setViewStyle(): string {
    return `width: ${this.width - 20}px;`;
  }

  onChanged(site: Site) {
    this.changed.emit(site);
  }
}
