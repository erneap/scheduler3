import { Component, Input } from '@angular/core';
import { Workday } from 'src/app/models/employees/assignments';
import { Employee } from 'src/app/models/employees/employee';
import { Work } from 'src/app/models/employees/work';
import { Workcenter } from 'src/app/models/sites/workcenter';
import { EmployeeWorkResponse } from 'src/app/models/web/employeeWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';
import { WorkWeek } from '../employee-schedule.model';
import { Site } from 'src/app/models/sites/site';
import { AppStateService } from 'src/app/services/app-state.service';

@Component({
  selector: 'app-employee-schedule-month',
  templateUrl: './employee-schedule-month.component.html',
  styleUrls: ['./employee-schedule-month.component.scss']
})
export class EmployeeScheduleMonthComponent {
  @Input() workcenters: Workcenter[] = [];
  @Input() width: number = 714;
  months: string[] = new Array("January", "February", "March", "April", "May",
    "June", "July", "August", "September", "October", "November", "December");

  weekdays: string[] = new Array("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");

  month: Date = new Date();
  startDate: Date = new Date();
  endDate: Date = new Date();
  lastWork: Date = new Date(0);

  workweeks: WorkWeek[] = [];
  monthLabel: string = "";

  constructor(
    protected siteService: SiteService,
    protected employeeService: EmployeeService,
    protected teamService: TeamService,
    protected dialogService: DialogService,
    protected authService: AuthService,
    protected appState: AppStateService
  ) {
    this.month = new Date();
    this.month = new Date(this.month.getFullYear(), this.month.getMonth(), 1);
    if (this.appState.viewWidth < this.width) {
      const cWidth = Math.floor((this.appState.viewWidth - 14) / 7);
      this.width = (cWidth * 7) + 14;
    }
    this.setMonth();
  }

  getCellWidth(): number {
    return (this.width - 14) / 7;
  }

  setMonth() {
    this.monthLabel = `${this.months[this.month.getMonth()]} `
      + `${this.month.getFullYear()}`;
    
    // calculate the display's start and end date, where start date is always
    // the sunday before the 1st of the month and end date is the saturday after
    // the end of the month.
    this.startDate = new Date(Date.UTC(this.month.getFullYear(), 
      this.month.getMonth(), 1, 0, 0, 0));
    while (this.startDate.getUTCDay() !== 0) {
      this.startDate = new Date(this.startDate.getTime() - (24 * 3600000));
    }
    this.endDate = new Date(Date.UTC(this.month.getFullYear(), 
      this.month.getMonth() + 1, 1, 0, 0, 0));
    while (this.endDate.getUTCDay() !== 0) {
      this.endDate = new Date(this.endDate.getTime() + (24 * 3600000));
    }
    
    const emp = this.employeeService.getEmployee();
    if (emp) {
      if (!emp.hasWorkForYear(this.month.getFullYear())) {
        this.dialogService.showSpinner();
        this.employeeService.retrieveEmployeeWork(emp.id, 
          this.month.getFullYear()).subscribe({
          next: resp => {
            this.dialogService.closeSpinner();
            if (resp && resp.id !== '') {
              if (emp.id === resp.id && resp.work) {
                resp.work.forEach(wk => {
                  emp.addWork(wk);
                });
                this.employeeService.setEmployee(emp);
              }
            }
            this.setWorkweeks(emp);
          },
          error: (err: EmployeeWorkResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = err.exception;
          }
        });
      } else {
        this.setWorkweeks(emp);
      }
    }

    if (emp && emp.work) {
      emp.work.forEach(wk => {
        if (wk.dateWorked.getTime() > this.lastWork.getTime()) {
          this.lastWork = new Date(wk.dateWorked);
        }
      });
    }
  }

  setWorkweeks(emp: Employee) {
    this.workweeks = [];
    let count = -1;
    let start = new Date(this.startDate);
    var workweek: WorkWeek | undefined;
    while (start.getTime() < this.endDate.getTime()) {
      if (!workweek || start.getUTCDay() === 0) {
        count++;
        workweek = new WorkWeek(count);
        this.workweeks.push(workweek);
      }
      if (emp) {
        let wd = emp.getWorkday(emp.site, start, this.lastWork);
        if (!wd) {
          wd = new Workday();
          wd.id = start.getUTCDay();
        } else if (wd.id === 0) {
          wd.id = start.getUTCDay();
        }
        wd.date = new Date(start.getTime());
        workweek.setWorkday(wd, start);
      } else {
        const wd = new Workday();
        workweek.setWorkday(wd, start);
      }
      start = new Date(start.getTime() + (24 * 3600000));
    }
    this.workweeks.sort((a,b) => a.compareTo(b));
  }

  changeMonth(direction: string, period: string) {
    if (direction.toLowerCase() === 'up') {
      if (period.toLowerCase() === 'month') {
        this.month = new Date(this.month.getFullYear(), 
          this.month.getMonth() + 1, 1);
      } else if (period.toLowerCase() === 'year') {
        this.month = new Date(this.month.getFullYear() + 1, 
        this.month.getMonth(), 1);
      }
    } else {
      if (period.toLowerCase() === 'month') {
        this.month = new Date(this.month.getFullYear(), 
          this.month.getMonth() - 1, 1);
      } else if (period.toLowerCase() === 'year') {
        this.month = new Date(this.month.getFullYear() - 1, 
        this.month.getMonth(), 1);
      }
    }
    this.setMonth();
  }

  getMoveStyle(): string {
    const ratio = this.width / 714;
    return `width: ${this.getCellWidth()}px;font-size: ${1.3 * ratio}em;`;
  }

  getMonthStyle(): string {
    const ratio = this.width / 714;
    let cWidth = this.getCellWidth();
    const mWidth = this.width - (4 * (cWidth + 2));
    return `width: ${mWidth}px;font-size: ${1.3 * ratio}em;`
  }

  getDayStyle(): string {
    const ratio = this.width / 714;
    return `width: ${this.getCellWidth()}px;font-size: ${1.2 * ratio}em;`;
  }
}
