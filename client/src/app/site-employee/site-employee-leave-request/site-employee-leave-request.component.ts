import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Employee, IEmployee } from 'src/app/models/employees/employee';

@Component({
  selector: 'app-site-employee-leave-request',
  templateUrl: './site-employee-leave-request.component.html',
  styleUrls: ['./site-employee-leave-request.component.scss']
})
export class SiteEmployeeLeaveRequestComponent {
  private _employee: Employee = new Employee();
  @Input()
  public set employee(iEmp: IEmployee) {
    this._employee = new Employee(iEmp);
  }
  get employee(): Employee {
    return this._employee;
  }
  @Output() changed = new EventEmitter<Employee>();

  employeeChanged(emp: Employee) {
    this.changed.emit(new Employee(emp));
  }
}
