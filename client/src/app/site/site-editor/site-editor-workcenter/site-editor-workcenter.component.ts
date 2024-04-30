import { Component, Input } from '@angular/core';
import { ListItem } from 'src/app/generic/button-list/listitem';
import { Work } from 'src/app/models/employees/work';
import { ISite, Site } from 'src/app/models/sites/site';
import { Workcenter } from 'src/app/models/sites/workcenter';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-site-editor-workcenter',
  templateUrl: './site-editor-workcenter.component.html',
  styleUrls: ['./site-editor-workcenter.component.scss']
})
export class SiteEditorWorkcenterComponent {
  private _team: string = '';
  @Input() 
  public set teamid(id: string) {
    this._team = id;
  }
  get teamid(): string {
    return this._team;
  }
  private _site: Site = new Site();
  @Input()
  public set site(s: ISite) {
    this._site = new Site(s);
    this.setWorkcenterList();
  }
  get site(): Site {
    return this._site;
  }
  @Input() width: number = 1048;
  workcenters: ListItem[] = [];
  selectedWorkcenter: Workcenter;

  constructor(
    protected authService: AuthService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected dialogService: DialogService
  ) {
    const iteam = this.teamService.getTeam();
    if (iteam) {
      this.teamid = iteam.id;
    }
    const isite = this.siteService.getSite();
    if (isite) {
      this.site = isite;
    }
    this.selectedWorkcenter = new Workcenter();
    this.selectedWorkcenter.id = 'new';
  }

  setWorkcenterList() {
    this.workcenters = [];
    this.workcenters.push(new ListItem('new', 'Add New Workcenter'));
    this.site.workcenters.sort((a,b) => a.compareTo(b));
    this.site.workcenters.forEach(wc => {
      this.workcenters.push(new ListItem(wc.id, wc.name));
    });
  }

  setItemClass(id: string): string {
    if (id.toLowerCase() === this.selectedWorkcenter.id.toLowerCase()) {
      return `item selected`;
    }
    return 'item';
  }
}
