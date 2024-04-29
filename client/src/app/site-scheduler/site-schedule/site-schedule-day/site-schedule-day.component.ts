import { Component, Input } from '@angular/core';
import { IWorkday, Workday } from 'src/app/models/employees/assignments';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-site-schedule-day',
  templateUrl: './site-schedule-day.component.html',
  styleUrls: ['./site-schedule-day.component.scss']
})
export class SiteScheduleDayComponent {
  private _day: Workday = new Workday();
  private _date: Date = new Date();
  private _base: string = 'background-color: white; color: black;';
  @Input()
  public set day(wd: IWorkday) {
    this._day = new Workday(wd);
    this.setDayStyle();
  }
  get day(): Workday {
    return this._day;
  }
  @Input()
  public set date(dt: Date) {
    this._date = new Date(dt);
    this.setDayStyle();
  }
  get date(): Date {
    return this._date;
  }
  @Input()
  public set baseClass(st: string) {
    this._base = st;
    this.setDayStyle();
  }
  get baseClass(): string {
    return this._base;
  }
  dayStyle: string = 'background-color: white; color: black;';

  constructor(
    protected teamService: TeamService
  ) { }

  setDayStyle() {
    this.dayStyle = this.baseClass;
    const team = this.teamService.getTeam();
    let found = false;
    if (team && team.workcodes && team.workcodes.length > 0) {
      team.workcodes.forEach(wc => {
        if (wc.id.toLowerCase() === this.day.code.toLowerCase()) {
          found = true;
          this.dayStyle = `background-color: #${wc.backcolor};`
            + `color: #${wc.textcolor};`
          if (wc.backcolor.toLowerCase() === "ffffff" 
            && (this.date.getUTCDay() === 0 || this.date.getUTCDay() === 6)) {
            this.dayStyle = `background-color: cyan;`
              + `color: black;`
          } else if (wc.backcolor.toLowerCase() === "ffffff") {
            this.dayStyle = this.baseClass;
          }
        }
      });
    }
    if (!found && (this.date.getUTCDay() === 0 || this.date.getUTCDay() === 6)) {
      this.dayStyle = `background-color: cyan;color: black;`;
    }
  }
}
