import { Component } from '@angular/core';
import { Workcode } from 'src/app/models/teams/workcode';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-site-schedule-all',
  templateUrl: './site-schedule-all.component.html',
  styleUrls: ['./site-schedule-all.component.scss']
})
export class SiteScheduleAllComponent {
  leavecodes: Workcode[];

  constructor(
    protected teamService: TeamService,
  ) {
    this.leavecodes = [];
    const iTeam = this.teamService.getTeam();
    if (iTeam) {
      iTeam.workcodes.forEach(wc => {
        if (wc.backcolor.toLowerCase() !== 'ffffff' ) {
          this.leavecodes.push(new Workcode(wc));
        }
      });
    }
    this.leavecodes.sort((a,b) => a.compareTo(b));
  }
}
