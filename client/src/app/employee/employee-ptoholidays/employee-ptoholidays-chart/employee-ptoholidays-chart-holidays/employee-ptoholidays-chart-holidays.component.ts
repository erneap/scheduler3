import { Component, Input } from '@angular/core';
import { Employee, IEmployee } from 'src/app/models/employees/employee';
import { LeaveDay } from 'src/app/models/employees/leave';
import { CompanyHoliday } from 'src/app/models/teams/company';
import { Team } from 'src/app/models/teams/team';
import { AppStateService } from 'src/app/services/app-state.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-employee-ptoholidays-chart-holidays',
  templateUrl: './employee-ptoholidays-chart-holidays.component.html',
  styleUrl: './employee-ptoholidays-chart-holidays.component.scss'
})
export class EmployeePTOHolidaysChartHolidaysComponent {
  private _year: number = (new Date()).getUTCFullYear();
  private _employee: Employee | undefined;
  @Input() 
  public set year(yr: number) {
    this._year = yr;
    this.setHolidays();
  } 
  get year(): number {
    return this._year;
  }
  @Input()
  public set employee(emp: IEmployee) {
    this._employee = new Employee(emp);
    this.setHolidays();
  }
  get employee(): Employee {
    if (this._employee) {
      return this._employee;
    } else {
      this._employee = this.empService.getEmployee();
      if (this._employee) {
        return this._employee;
      }
      return new Employee();
    }
  }
  @Input()
  public set employeeid(id: string) {
    if (id !== '') {
      const site = this.siteService.getSite();
      if (site && site.employees && site.employees.length > 0) {
        site.employees.forEach(emp => {
          if (emp.id === id) {
            this._employee = new Employee(emp);
          }
        })
      } 
    }
    if (!this._employee) {
      this._employee = this.empService.getEmployee()
    }
    this.setHolidays();
  }
  get employeeid(): string {
    if (this._employee) {
      return this._employee.id;
    }
    return '';
  }
  private _width: number = 455;
  @Input()
  public set width(w: number) {
    this._width = w;
  }
  get width(): number {
    return this._width;
  }
  holidays: CompanyHoliday[] = [];
  empHolidays: LeaveDay[] = [];

  constructor(
    protected empService: EmployeeService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected stateService: AppStateService
  ) {
    this.setHolidays();
    this._employee = empService.getEmployee()
  }

  setHolidays() {
    this.holidays = [];
    const iEmp = this.employee;
    const iTeam = this.teamService.getTeam();
    if (iEmp && iTeam) {
      const emp = new Employee(iEmp);
      const team = new Team(iTeam);
      team.companies.forEach(co => {
        if (co.id.toLowerCase() === emp.companyinfo.company.toLowerCase()) {
          if (co.holidays.length > 0) {
            co.holidays.forEach(hol => {
              const holiday = new CompanyHoliday(hol);
              holiday.active = this.isEmployeeActive(holiday, emp);
              this.holidays.push(holiday);
            });
          }
        }
      });

      this.empHolidays = [];
      emp.leaves.forEach(lv => {
        if (lv.leavedate.getUTCFullYear() === this.year 
          && lv.code.toLowerCase() === 'h') {
          this.empHolidays.push(new LeaveDay(lv));
        }
      });
      this.empHolidays.sort((a,b) => a.compareTo(b));

      // put tagged holidays assigned to correct company holiday
      this.empHolidays.forEach(eHol => {
        if (eHol.tagday !== '') {
          let found = false
          this.holidays.forEach(cHol => {
            if (cHol.active) {
              const holID = `${cHol.id}${cHol.sort}`;
              if (!found && eHol.tagday.toLowerCase() === holID.toLowerCase()
                && cHol.getLeaveDayTotalHours() + eHol.hours <= 8.0) {
                found = true;
                cHol.addLeaveDay(eHol);
                eHol.used = true;
              }
            }
          });
        }
      });

      // put holidays, status actual, in display order
      this.empHolidays.forEach(eHol => {
        if (eHol.status.toLowerCase() === "actual") {
          let found = false
          this.holidays.forEach(cHol => {
            if (cHol.active && !eHol.used) {
              if (!found && cHol.getLeaveDayTotalHours() + eHol.hours <= 8.0) {
                found = true;
                cHol.addLeaveDay(eHol);
                eHol.used = true;
              }
            }
          });
        }
      });

      // loop through employee holiday and add leave for equal to ref dates first
      this.empHolidays.forEach(eHol => {
        if (!eHol.used){
          this.holidays.forEach(hol => {
            if (hol.active) {
              hol.actualdates.forEach(ad => {
                if (ad.getUTCFullYear() === this.year) {
                  const adStart = new Date(ad);
                  const adEnd = new Date(ad.getTime() + (24 * 3600000));
                  if (eHol.leavedate.getTime() >= adStart.getTime()
                    && eHol.leavedate.getTime() <= adEnd.getTime()
                    && !eHol.used  && hol.leaveDays.length === 0) {
                    hol.addLeaveDay(eHol);
                    eHol.used = true;
                  }
                }
              });
            }
          });
        }
      });

      // then loop again to fill in for non-reference dates
      this.empHolidays.forEach(eHol => {
        if (!eHol.used) {
          if (eHol.hours === 8.0) {
            let found = false;
            for (let i=0; i < this.holidays.length && !found; i++) {
              if (this.holidays[i].getLeaveDayTotalHours() === 0.0 
                && this.holidays[i].active) {
                found = true;
                this.holidays[i].addLeaveDay(eHol);
                eHol.used = true;
              }
            }
          } else if (eHol.hours < 8.0) {
            let found = false;
            for (let i=0; i < this.holidays.length && !found; i++) {
              if (this.holidays[i].getLeaveDayTotalHours() + eHol.hours <= 8.0 
                && this.holidays[i].active) {
                found = true;
                this.holidays[i].addLeaveDay(eHol);
                eHol.used = true;
              }
            }
          }
        }
      });

      // lastly, plug in holidays actually taken, even if outside the 
      // employee's active period
      this.empHolidays.forEach(eHol => {
        if (!eHol.used) {
          let found = false;
          for (let i=0; i < this.holidays.length && !found; i++) {
            if (this.holidays[i].getLeaveDayTotalHours() + eHol.hours <= 8.0
              && !this.holidays[i].active) {
              found = true;
              this.holidays[i].addLeaveDay(eHol);
            }
          }
        }
      });
    }
  }

  getHolidaysRemaining(): string {
    let total = 0;
    let holidays = 0;
    this.holidays.forEach(hol => {
      if (this.isActive(hol)) {
        holidays++;
        let holTotal = 0.0;
        hol.leaveDays.forEach(lv => {
          if (lv.status.toLowerCase() === 'actual') {
            holTotal += lv.hours;
          }
        });
        if (holTotal >= 8.0) {
          total++;
        }
      }
    });
    total = holidays - total;
    return total.toFixed(0);
  }

  getHolidaysHoursRemaining(): string {
    let total = 0.0;
    this.holidays.forEach(hol => {
      if (this.isActive(hol)) {
        total += 8.0;
        hol.leaveDays.forEach(lv => {
          if (lv.status.toLowerCase() === 'actual') {
            total -= lv.hours;
          }
        });
      }
    });
    return total.toFixed(1);
  }

  getHolidayHoursTaken(): string {
    let total = 0.0;
    this.holidays.forEach(hol => {
      hol.leaveDays.forEach(lv => {
        if (lv.status.toLowerCase() === 'actual') {
          total += lv.hours;
        }
      });
    });
    return total.toFixed(1);
  }

  isActive(holiday: CompanyHoliday): boolean {
    this.employee.assignments.sort((a,b) => a.compareTo(b));
    const actual = holiday.getActual(this.year);
    const startasgmt = this.employee.assignments[0];
    const endasgmt = this.employee.assignments[
      this.employee.assignments.length - 1];
    if (actual) {
      return (actual.getTime() >= startasgmt.startDate.getTime() &&
        actual.getTime() <= endasgmt.endDate.getTime());
    }
    return true;
  }

  isEmployeeActive(holiday: CompanyHoliday, employee: Employee): boolean {
    employee.assignments.sort((a,b) => a.compareTo(b));
    const actual = holiday.getActual(this.year);
    const startasgmt = employee.assignments[0];
    const endasgmt = employee.assignments[
      employee.assignments.length - 1];
    if (actual) {
      return (actual.getTime() >= startasgmt.startDate.getTime() &&
        actual.getTime() <= endasgmt.endDate.getTime());
    }
    return true;
  }

  getCodeStyle(): string {
    let ratio = this.width / 455;
    if (ratio > 1.0) { ratio = 1.0; }
    const width = Math.floor(41 * ratio);
    const height = Math.floor(30 * ratio);
    const fontSize = 1.2 * ratio;
    return `width: ${width}px;height: ${height}px;font-size:${fontSize}rem;`;
  }

  getReferenceStyle(): string {
    let ratio = this.width / 455;
    if (ratio > 1.0) { ratio = 1.0; }
    const width = Math.floor(100 * ratio);
    const height = Math.floor(30 * ratio);
    const fontSize = 1.2 * ratio;
    return `width: ${width}px;height: ${height}px;font-size:${fontSize}rem;`;
  }

  getUTCDatesStyle(): string {
    let ratio = this.width / 455;
    if (ratio > 1.0) { ratio = 1.0; }
    const width = Math.floor(249 * ratio);
    const height = Math.floor(30 * ratio);
    const fontSize = 1.2 * ratio;
    return `width: ${width}px;height: ${height}px;font-size:${fontSize}rem;`;
  }

  getHoursStyle(): string {
    let ratio = this.width / 455;
    if (ratio > 1.0) { ratio = 1.0; }
    const width = Math.floor(65 * ratio);
    const height = Math.floor(30 * ratio);
    const fontSize = 1.2 * ratio;
    return `width: ${width}px;height: ${height}px;font-size:${fontSize}rem;`;
  }

  getLabelStyle(): string {
    let ratio = this.width / 455;
    if (ratio > 1.0) { ratio = 1.0; }
    const width = Math.floor(458 * ratio);
    const height = Math.floor(30 * ratio);
    const fontSize = 1.2 * ratio;
    return `width: ${width}px;height: ${height}px;font-size:${fontSize}rem;`;
  }

  getTotalsStyle(): string {
    let ratio = this.width / 455;
    if (ratio > 1.0) { ratio = 1.0; }
    const width = Math.floor(138 * ratio);
    const height = Math.floor(30 * ratio);
    const fontSize = 1.0 * ratio;
    return `width: ${width}px;height: ${height}px;font-size:${fontSize}rem;`;
  }

}
