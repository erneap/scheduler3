import { Component, Input } from '@angular/core';
import { LeaveMonth } from 'src/app/models/employees/leave';
import { AppStateService } from 'src/app/services/app-state.service';

@Component({
  selector: 'app-pto-month',
  templateUrl: './pto-month.component.html',
  styleUrls: ['./pto-month.component.scss']
})
export class PtoMonthComponent {
  private _month: LeaveMonth = new LeaveMonth();
  @Input()
  public set leaveMonth(month: LeaveMonth) {
    this._month = new LeaveMonth(month);
  }
  get leaveMonth(): LeaveMonth {
    return this._month;
  }
  @Input() width: number = 455;
  months: string[] = new Array("JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL",
    "AUG", "SEP", "OCT", "NOV", "DEC");

  constructor(
    protected stateService: AppStateService
  ) {}

  getStyle(field: string): string {
    let answer = `${field} `;
    if (this.leaveMonth.active) {
      answer += 'active';
    } else {
      answer += 'disabled';
    }
    return answer;
  }

  getActualHours(): string {
    let total = 0.0;
    this._month.leaveGroups.forEach(lg => {
      lg.leaves.forEach(lv => {
        if (lv.status.toLowerCase() === 'actual' && lv.code.toLowerCase() === 'v') {
          total += lv.hours
        }
      });
    })
    return total.toFixed(1);
  }

  getProjectedHours(): string {
    let total = 0.0;
    this._month.leaveGroups.forEach(lg => {
      lg.leaves.forEach(lv => {
        if (lv.status.toLowerCase() !== 'actual' && lv.code.toLowerCase() === 'v') {
          total += lv.hours
        }
      });
    })
    return total.toFixed(1);
  }

  getMonthStyle(): string {
    let ratio = this.width / 455;
    if (ratio > 1.0) { ratio = 1.0; }
    const width = Math.floor(65 * ratio);
    const height = Math.floor(30 * ratio);
    const fontSize = 1.0 * ratio;
    return `width: ${width}px;height: ${height}px;font-size:${fontSize}rem;`;
  }

  getDatesStyle(): string {
    let ratio = this.width / 455;
    if (ratio > 1.0) { ratio = 1.0; }
    const width = Math.floor(260 * ratio);
    const height = Math.floor(30 * ratio);
    const fontSize = 1.0 * ratio;
    return `width: ${width}px;height: ${height}px;font-size:${fontSize}rem;`;
  }

}
