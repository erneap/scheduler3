import { Component } from '@angular/core';
import { Team } from 'src/app/models/teams/team';
import { Workcode } from 'src/app/models/teams/workcode';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-site-schedule-legend',
  templateUrl: './site-schedule-legend.component.html',
  styleUrls: ['./site-schedule-legend.component.scss']
})
export class SiteScheduleLegendComponent {
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
          if (wc.backcolor.toLowerCase() !== 'ffffff') {
            this.leavecodes.push(new Workcode(wc));
          }
        });
      }
    }
    this.leavecodes.sort((a,b) => a.compareTo(b));
  }
}
