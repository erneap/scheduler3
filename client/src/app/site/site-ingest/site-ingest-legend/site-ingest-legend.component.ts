import { Component } from '@angular/core';
import { Team } from 'src/app/models/teams/team';
import { Workcode } from 'src/app/models/teams/workcode';
import { TeamService } from 'src/app/services/team.service';

@Component({
    selector: 'app-site-ingest-legend',
    templateUrl: './site-ingest-legend.component.html',
    styleUrls: ['./site-ingest-legend.component.scss'],
    standalone: false
})
export class SiteIngestLegendComponent {
  leavecodes: Workcode[];

  constructor(
    protected teamService: TeamService 
  ) {
    this.leavecodes = [];
    const iTeam = this.teamService.getTeam();
    if (iTeam) {
      const team = new Team(iTeam);
      if (team.workcodes) {
        team.workcodes.forEach(wc => {
          if (wc.isLeave) {
            this.leavecodes.push(new Workcode(wc));
          }
        });
      }
    }
    this.leavecodes.sort((a,b) => a.compareTo(b));
  }
}
