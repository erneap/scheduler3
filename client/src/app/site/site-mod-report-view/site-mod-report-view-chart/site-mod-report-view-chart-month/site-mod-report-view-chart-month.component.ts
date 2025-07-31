import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MonthPeriod, WeekPeriod } from '../../site-mod-report-view.model';
import { Employee } from 'src/app/models/employees/employee';

@Component({
    selector: 'app-site-mod-report-view-chart-month',
    templateUrl: './site-mod-report-view-chart-month.component.html',
    styleUrl: './site-mod-report-view-chart-month.component.scss',
    standalone: false
})
export class SiteModReportViewChartMonthComponent {
  private _month: MonthPeriod = new MonthPeriod();
  @Input()
  public set month(m: MonthPeriod) {
    this._month = new MonthPeriod(m);
  }
  get month(): MonthPeriod {
    return this._month;
  }
  private _employees: Employee[] = [];
  @Input()
  public set employees(emps: Employee[]) {
    this._employees = [];
    emps.forEach(emp => {
      this._employees.push(new Employee(emp));
    });
    this._employees.sort((a,b) => a.compareTo(b));
  }
  get employees(): Employee[] {
    return this._employees;
  }
  @Output() changed = new EventEmitter<string>();

  getUTCMonthStyle(): string {
    let width = 50;
    if (this.month.expand) {
      width += 52 * this.month.weeks.length;
    }
    return `width: ${width}px;`;
  }

  getUTCMonth(): string {
    const year = `${this.month.month.getUTCFullYear()}`;
    return `${this.month.month.getUTCMonth() + 1}/${year.substring(2)}`;
  }

  getStyle(field: string, i: number): string {
    if (field.toLowerCase() === 'total') {
      return 'cell ' + (((i % 2) === 0) ? 'even' : 'odd') + 'total';
    }
    return 'cell ' + (((i % 2) === 0) ? 'even' : 'odd');
  }

  getValue(emp: Employee, start: Date, end: Date): number {
    return emp.getModTimeForPeriod(start, end);
  }

  getWeekValue(emp: Employee, week: WeekPeriod): string {
    const total = this.getValue(emp, week.start, week.end);
    return total.toFixed(1);
  }

  getTotalValue(emp: Employee): string {
    if (this.month.weeks.length > 0) {
      let total = this.getValue(emp, 
        this.month.weeks[this.month.weeks.length - 1].start, 
        this.month.weeks[0].end);
      return total.toFixed(1);
    }
    return '0.0';
  }

  expandMonth() {
    this.month.expand = !this.month.expand;
    const oMonth = `${this.month.month.getTime()}|${this.month.expand}`;
    this.changed.emit(oMonth);
  }
}
