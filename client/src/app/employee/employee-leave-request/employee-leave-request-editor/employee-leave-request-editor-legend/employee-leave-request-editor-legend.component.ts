import { Component, Input } from '@angular/core';
import { Workcode } from 'src/app/models/teams/workcode';

@Component({
    selector: 'app-employee-leave-request-editor-legend',
    templateUrl: './employee-leave-request-editor-legend.component.html',
    styleUrls: ['./employee-leave-request-editor-legend.component.scss'],
    standalone: false
})
export class EmployeeLeaveRequestEditorLegendComponent {
  @Input() leavecodes: Workcode[] = [];
  @Input() width: number = 700;

  displayStyle(): string {
    return `width: ${this.width}px;`;
  }

  codeStyle(wc: Workcode): string {
    let ratio = this.width / 700;
    if (ratio > 1.0) ratio = 1.0;
    const fontSize = 0.8 * ratio;
    const width = Math.floor(200 * ratio);
    const height = Math.floor(20 * ratio);
    return `background-color: #${wc.backcolor};color: #${wc.textcolor};`
      + `width: ${width}px;height: ${height}px;font-size: ${fontSize}rem;`;
  }
}
