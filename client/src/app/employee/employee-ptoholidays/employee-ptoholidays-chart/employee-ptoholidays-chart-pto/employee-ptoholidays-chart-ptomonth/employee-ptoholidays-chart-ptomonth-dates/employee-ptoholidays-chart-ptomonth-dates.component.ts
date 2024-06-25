import { Component, Input } from '@angular/core';
import { ILeaveDay, LeaveDay } from 'src/app/models/employees/leave';
import { AppStateService } from 'src/app/services/app-state.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-employee-ptoholidays-chart-ptomonth-dates',
  templateUrl: './employee-ptoholidays-chart-ptomonth-dates.component.html',
  styleUrl: './employee-ptoholidays-chart-ptomonth-dates.component.scss'
})
export class EmployeePTOHolidaysChartPTOMonthDatesComponent {
  private _leaves: LeaveDay[] = [];
  @Input()
  public set leaves(lvs: ILeaveDay[]) {
    this._leaves = [];
    lvs.forEach(lv => {
      this._leaves.push(new LeaveDay(lv));
    });
    this._leaves.sort((a,b) => a.compareTo(b));
    this.setDisplayStyle();
    this.setShowHours();
  }
  get leaves(): LeaveDay[] {
    return this._leaves;
  }
  displayStyle: string = 'color: black;'
  tooltip: string = '';
  showHours: boolean = false;

  constructor(
    protected teamService: TeamService,
    protected empService: EmployeeService,
    protected stateService: AppStateService
  ) { }

  setDisplayStyle(): void {
    let ratio = (this.stateService.viewWidth / 778);
    if (ratio > 1.0) { ratio = 1.0; }
    let answer = 'background-color: white;color: black;';

    const team = this.teamService.getTeam();
    if (team && this.leaves.length > 0) {
      team.workcodes.forEach(wc => {
        if (wc.id.toLowerCase() === this.leaves[0].code.toLowerCase()) {
          answer = `color: #${wc.textcolor};background-color: #${wc.backcolor};`;
          this.tooltip = wc.title;
          if (wc.id.toLowerCase() === 'v') {
            if (this.leaves[0].status.toLowerCase() === 'actual') {
              answer = `background-color: white;color: black;`;
            } else {
              answer = `background-color: #${wc.textcolor};color: #${wc.backcolor};`;
            }
          }
        }
      });
    }
    this.displayStyle = answer;
  }

  setShowHours() {
    let answer = false;
    let hours = 8;
    const emp = this.empService.getEmployee();
    if (emp && this.leaves.length > 0) {
      hours = emp.getStandardWorkday(emp.site, this.leaves[0].leavedate);
      answer = (this.leaves[0].hours < hours);
    }
    this.showHours = answer;
  }

  getHours(): string {
    if (Math.floor(this.leaves[0].hours) === this.leaves[0].hours) {
      return this.leaves[0].hours.toFixed(0);
    }
    return this.leaves[0].hours.toFixed(1);
  }
}
