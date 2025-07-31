import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ILeaveRequest, LeaveDay, LeaveRequest } from 'src/app/models/employees/leave';
import { Workcode } from 'src/app/models/teams/workcode';
import { LeaveWeek } from '../employee-leave-request-editor-calendar/employee-leave-request-editor-calendar.component';
import { Workcenter } from 'src/app/models/sites/workcenter';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';
import { Team } from 'src/app/models/teams/team';
import { Site } from 'src/app/models/sites/site';

@Component({
    selector: 'app-employee-leave-request-editor-modtime-calendar',
    templateUrl: './employee-leave-request-editor-modtime-calendar.component.html',
    styleUrl: './employee-leave-request-editor-modtime-calendar.component.scss',
    standalone: false
})
export class EmployeeLeaveRequestEditorModtimeCalendarComponent {
  private _request: LeaveRequest = new LeaveRequest();
  @Input()
  public set request(req: ILeaveRequest) {
    this._request = new LeaveRequest(req);
    this.setWorkweeks()
  }
  get request(): LeaveRequest {
    return this._request;
  }
  @Input() width: number = 700;
  @Input() height: number = 400;
  @Output() changed = new EventEmitter<string>();
  workcodes: Workcode[];
  workcenters: Workcenter[];

  weeks: LeaveWeek[] = [];
  daysOfWeek = [ 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa' ];

  constructor(
    protected siteService: SiteService,
    protected teamService: TeamService
  ) {
    this.workcodes = [];
    const iTeam = this.teamService.getTeam();
    if (iTeam) {
      const team = new Team(iTeam);
      team.workcodes.forEach(wc => {
        this.workcodes.push(new Workcode(wc));
      });
      this.workcodes.sort((a,b) => a.compareTo(b));
    }
    this.workcenters = [];
    const iSite = this.siteService.getSite();
    if (iSite) {
      const site = new Site(iSite);
      site.workcenters.forEach(wc => {
        this.workcenters.push(new Workcenter(wc));
      });
      this.workcenters.sort((a,b) => a.compareTo(b));
    }
  }

  viewStyle(): string {
    let cellWidth = Math.floor(this.width / 7);
    this.width = cellWidth * 7;
    const width = (cellWidth + 2) * 7;
    return `width: ${width}px;height: ${this.height}px;`;
  }

  setWorkweeks() {
    this.weeks = [];
    let start = new Date(this.request.startdate);
    start = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 
      start.getUTCDate(), 0, 0, 0, 0));
    while (start.getUTCDay() !== 0) {
      start = new Date(start.getTime() - (24 * 3600000));
    }
    let end = new Date(this.request.enddate);
    end = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 
      end.getUTCDate(), 
      0, 0, 0, 0));
    while (end.getUTCDay() !== 6) {
      end = new Date(end.getTime() + (24 * 3600000));
    }
    let week: LeaveWeek | undefined;
    while (start.getTime() <= end.getTime()) {
      let found = false;
      if (!week || start.getUTCDay() === 0) {
        if (week) {
          this.weeks.push(week);
        }
        week = new LeaveWeek();
        week.start = start;
        week.days = [];
      }
      this.request.requesteddays.forEach(lv => {
        if (lv.useLeave(start)) {
          found = true;
          if (week) {
            week.days.push(new LeaveDay(lv));
          }
        }
      });
      if (!found) {
        const lv = new LeaveDay();
        lv.leavedate = new Date(start);
        week.days.push(lv);
      }
      start = new Date(start.getTime() + (24 * 3600000));
    }
    if (week) {
      this.weeks.push(week);
    }
    this.weeks.sort((a,b) => a.compareTo(b));
  }

  dayLabelStyle(): string {
    let ratio = this.width / 700;
    if (ratio > 1.0) ratio = 1.0;
    const width = Math.floor(100 * ratio);
    const height = Math.floor(20 * ratio);
    return `width: ${width}px;height: ${height}px;font-size: ${ratio}rem;`;
  }

  onChange(chg: string) {
    this.changed.emit(chg);
  }
}
