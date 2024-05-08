import { Component, Input } from '@angular/core';
import { Employee } from 'src/app/models/employees/employee';
import { Workcode } from 'src/app/models/teams/workcode';

@Component({
  selector: 'app-site-ingest-form-month-employee',
  templateUrl: './site-ingest-form-month-employee.component.html',
  styleUrls: ['./site-ingest-form-month-employee.component.scss']
})
export class SiteIngestFormMonthEmployeeComponent {
  @Input() width: number = 1135;
  @Input() leavecodes: Workcode[] = [];
  @Input() employee: Employee = new Employee();
  @Input() month: Date = new Date();

  nameWidth(): number {
    const ratio = this.width / 1135;
    let width = Math.floor(200 * ratio);
    if (width < 150) {
      width = 150;
    }
    return width;
  }

  nameStyle(): string {
    return `width: ${this.nameWidth()}px;`
  }

  nameCellStyle(emp?: Employee): string {
    const ratio = this.width / 1135;
    let fontSize = Math.floor(12 * ratio);
    if (fontSize < 9) fontSize = 9;
    let height = Math.floor(25 * ratio);
    if (height < 15) {
      height = 15;
    }
    if (!emp) {
      return `background-color: black;color: white;font-size: ${fontSize}pt;`
        + `width: ${this.nameWidth()}px;height: ${height}px;`;
    } else if (emp.even) {
      return `background-color: #c0c0c0;color: black;font-size: ${fontSize}pt;`
        + `width: ${this.nameWidth()}px;height: ${height}px;`;
    } else {
      return `background-color: white;color: black;font-size: ${fontSize}pt;`
        + `width: ${this.nameWidth()}px;height: ${height}px;`;
    }
  }

  daysStyle(): string {
    let width = this.width - (this.nameWidth() + 2); 
    return `width: ${width}px;`;
  }
}
