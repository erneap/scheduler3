import { Component, Input } from '@angular/core';
import { Employee, IEmployee } from 'src/app/models/employees/employee';
import { LeaveGroup, LeaveMonth } from 'src/app/models/employees/leave';
import { AppStateService } from 'src/app/services/app-state.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { SiteService } from 'src/app/services/site.service';

@Component({
  selector: 'app-employee-ptoholidays-chart-pto',
  templateUrl: './employee-ptoholidays-chart-pto.component.html',
  styleUrl: './employee-ptoholidays-chart-pto.component.scss'
})
export class EmployeePTOHolidaysChartPTOComponent {
  private _year: number = (new Date()).getUTCFullYear();
  private _employee: Employee | undefined;
  @Input()
  public set year(yr: number) {
    this._year = yr;
    this.setYear();
  }
  get year(): number {
    return this._year;
  }
  @Input()
  public set employee(emp: IEmployee) {
    this._employee = new Employee(emp);
    this.setYear();
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
  }
  get employeeid(): string {
    if (this._employee) {
      return this._employee.id;
    }
    return '';
  }
  @Input() width: number = 455;
  leaveMonths: LeaveMonth[];
  actual: number = 0.0
  requested: number = 0.0;
  annual: number = 0.0;
  carryover: number = 0.0;
  balance: number = 0.0;
  balanceStyle: string = "balancepos";

  constructor(
    protected empService: EmployeeService,
    protected siteService: SiteService,
    protected stateService: AppStateService
  ) {
    this.leaveMonths = [];
    this._employee = this.empService.getEmployee();
    this.setYear();
  }

  setYear() {
    this.leaveMonths = [];
    
    this.actual = 0.0;
    this.requested = 0.0;
    this.annual = 0.0;
    this.carryover = 0.0;
    this.balance = 0.0;
    this.employee.assignments.sort((a,b) => a.compareTo(b));
    const startAsgmt = this.employee.assignments[0];
    const endAsgmt = this.employee.assignments[this.employee.assignments.length - 1];
    this.balanceStyle = "balancepos";
    for (let i=0; i < 12; i++) {
      let month = new LeaveMonth();
      month.month = new Date(Date.UTC(this._year, i, 1));
      let endMonth = new Date(Date.UTC(this._year, i+1, 1));
      endMonth = new Date(endMonth.getTime() - 3600000);
      let active = (startAsgmt?.startDate.getTime() > endMonth.getTime() 
        || (endAsgmt?.endDate.getTime() < month.month.getTime()));
      month.active = !active;
      this.leaveMonths.push(month);
    }
    const emp = this.employee;
    if (emp) {
      if (emp.leaves.length > 0) {
        emp.leaves.sort((a,b) => a.compareTo(b));
        emp.leaves.forEach(lv => {
          if (lv.code.toLowerCase() !== 'h' 
          && lv.leavedate.getUTCFullYear() === this.year) {
            // first get the leave month for to display in:
            this.leaveMonths.forEach(lm => {
              if (lm.month.getUTCMonth() === lv.leavedate.getUTCMonth()) {
                if (lm.leaveGroups.length > 0) {
                  let added = false;
                  for (let g = 0; g < lm.leaveGroups.length && !added; g++) {
                    const lg = lm.leaveGroups[g];
                    if (lg.addToThisGroup(lv)) {
                      lg.addLeave(lv);
                      lm.leaveGroups[g] = lg;
                      added = true;
                    }
                  }
                  if (!added) {
                    const lg = new LeaveGroup();
                    lg.addLeave(lv);
                    lm.leaveGroups.push(lg);
                  }
                } else {
                  const lg = new LeaveGroup();
                  lg.addLeave(lv);
                  lm.leaveGroups.push(lg);
                }
              } 
            });
            // next add PTO/Vacation to actuals and requested totals
            if (lv.code.toLowerCase() === 'v') {
              if (lv.status.toLowerCase() === 'actual') {
                this.actual += lv.hours;
              } else {
                this.requested += lv.hours;
              }
            }
          }
        });
        this.leaveMonths
      }

      this.annual = 0.0;
      this.carryover = 0.0;
      emp.balance.sort((a,b) => a.compareTo(b));
      emp.balance.forEach(bal => {
        if (bal.year === this._year) {
          this.annual = bal.annual;
          this.carryover = bal.carryover;
          this.balance = (this.annual + this.carryover) 
            - (this.actual + this.requested);
          if (this.balance < 0) {
            this.balanceStyle = "balanceneg";
          }
        }
      });
      if (this.annual === 0.0) {
        if (emp.balance.length > 0) {
          const lastYear = emp.balance[emp.balance.length - 1].year
          const lastBalance = emp.balance[emp.balance.length - 1].annual;
          let lastCarry = emp.balance[emp.balance.length - 1].carryover;
          let total = lastBalance + lastCarry;
          emp.leaves.forEach(lv => {
            if (lv.code.toLowerCase() === 'v' 
              && lv.leavedate.getUTCFullYear() === lastYear) {
              total -= lv.hours;
            }
          });
          if (total > 40.0) { 
            total = 40.0;
          }
          this.annual = lastBalance;
          this.carryover = total;
          this.balance = (this.annual + this.carryover)
            - (this.actual + this.requested);
        }
      }
    }
  }

  getUTCMonthStyle(): string {
    let ratio = this.width / 455;
    if (ratio > 1.0) { ratio = 1.0; }
    const width = Math.floor(65 * ratio);
    const height = Math.floor(30 * ratio);
    const fontSize = 1.2 * ratio;
    return `width: ${width}px;height: ${height}px;font-size:${fontSize}rem;`;
  }

  getUTCDatesStyle(): string {
    let ratio = this.width / 455;
    if (ratio > 1.0) { ratio = 1.0; }
    const width = Math.floor(260 * ratio);
    const height = Math.floor(30 * ratio);
    const fontSize = 1.2 * ratio;
    return `width: ${width}px;height: ${height}px;font-size:${fontSize}rem;`;
  }

  getTotalsStyle(): string {
    let ratio = this.width / 455;
    if (ratio > 1.0) { ratio = 1.0; }
    const width = Math.floor(91 * ratio);
    const height = Math.floor(30 * ratio);
    const fontSize = 1.0 * ratio;
    return `width: ${width}px;height: ${height}px;font-size:${fontSize}rem;`;
  }

  getLabelStyle(): string {
    let ratio = this.width / 455;
    if (ratio > 1.0) { ratio = 1.0; }
    const width = Math.floor(460 * ratio);
    const height = Math.floor(30 * ratio);
    const fontSize = 1.2 * ratio;
    return `width: ${width}px;height: ${height}px;font-size:${fontSize}rem;`;
  }
}
