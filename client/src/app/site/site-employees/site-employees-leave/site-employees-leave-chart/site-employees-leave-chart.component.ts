import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Employee, IEmployee } from 'src/app/models/employees/employee';
import { LeaveDay } from 'src/app/models/employees/leave';
import { Workcode } from 'src/app/models/teams/workcode';

@Component({
  selector: 'app-site-employees-leave-chart',
  templateUrl: './site-employees-leave-chart.component.html',
  styleUrl: './site-employees-leave-chart.component.scss'
})
export class SiteEmployeesLeaveChartComponent {
  private _employee: Employee = new Employee()
  @Input()
  public set employee(emp: IEmployee) {
    this._employee = new Employee(emp);
    this.setLeaves();
  }
  get employee(): Employee {
    return this._employee;
  }
  private _year: number = (new Date()).getUTCFullYear();
  @Input() 
  public set year(y: number) {
    this._year = y;
    this.setLeaves();
  }
  get year(): number {
    return this._year;
  }
  @Input() width: number = 715;
  @Input() height: number = 800;
  @Input() leavecodes: Workcode[] = [];
  @Output() changed = new EventEmitter<Employee>();
  leaves: LeaveDay[] = [];

  setLeaves() {
    this.leaves = [];
    this.employee.leaves.forEach(lv => {
      if (lv.leavedate.getUTCFullYear() === this.year) {
        this.leaves.push(new LeaveDay(lv));
      }
    });
    this.leaves.sort((a,b) => b.compareTo(a));
  }

  onChange(emp: Employee) {
    this.changed.emit(emp);
  }

  viewStyle(): string {
    if (this.width > 715) this.width = 715;
    const height = this.height - 22;
    return `width: ${this.width + 10}px;height: ${height}px;`;
  }
}
