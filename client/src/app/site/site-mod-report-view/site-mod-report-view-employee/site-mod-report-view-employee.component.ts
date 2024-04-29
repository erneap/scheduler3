import { Component, Input } from '@angular/core';
import { Employee, IEmployee } from 'src/app/models/employees/employee';
import { MonthPeriod } from '../site-mod-report-view.component';

@Component({
  selector: 'app-site-mod-report-view-employee',
  templateUrl: './site-mod-report-view-employee.component.html',
  styleUrls: ['./site-mod-report-view-employee.component.scss']
})
export class SiteModReportViewEmployeeComponent {
  private _employee: Employee = new Employee();
  private _count: number = 0;
  private _months: MonthPeriod[] = [];

  @Input() 
  public set employee(iEmp: IEmployee) {
    this._employee = new Employee(iEmp);
  }
  get employee(): Employee {
    return this._employee;
  }
  @Input()
  public set count(ct: number) {
    this._count = ct;
  }
  get count(): number {
    return this._count;
  }
  @Input()
  public set months(mths: MonthPeriod[]) {
    this._months = [];
    mths.forEach(m => {
      this._months.push(new MonthPeriod(m))
    });
  }
  get months(): MonthPeriod[] {
    return this._months;
  }

  expand(month: Date) {
    for (let i = 0; i < this.months.length; i++) {
      if (this.months[i].month.getTime() === month.getTime()) {
        this.months[i].expand = true;
      }
    }
  }

  contract(month: Date) {
    for (let i = 0; i < this.months.length; i++) {
      if (this.months[i].month.getTime() === month.getTime()) {
        this.months[i].expand = false;
      }
    }
  }

  getStyle(name: string, count: number, value: number): string {
    let answer = `${name} ${(count % 2 === 0) ? "eventotal" : "oddtotal"}`;
    if (name === 'cell') {
      answer = `${name} ${(count % 2 === 0) ? "even" : "odd"}`;
    } else if (name === 'balance') {
      answer = `${name} ${(count % 2 === 0) ? "evenbal" : "oddbal"}`;
    }
    return answer;
  }

  getValue(start: Date, end: Date): number {
    return this.employee.getModTimeForPeriod(start, end);
  }

  getTotalValue(): string {
    if (this.months.length > 0) {
      let total = this.getValue(this.months[this.months.length - 1].startDate(), 
        this.months[0].endDate());
      return total.toFixed(1);
    }
    return '0.0';
  }
}
