import { Component } from '@angular/core';
import { AppStateService } from 'src/app/services/app-state.service';

@Component({
  selector: 'app-site-schedule',
  templateUrl: './site-schedule.component.html',
  styleUrls: ['./site-schedule.component.scss']
})
export class SiteScheduleComponent {
  constructor(
    protected appState: AppStateService
  ) {}

  getCalendarStyle(): string {
    if (this.appState.viewHeight < this.appState.viewWidth) {
      let height = Math.floor(this.appState.viewHeight / 4);
      if (height > 150) {
        height = 150;
      }
      return `bottom: ${height}px;`;
    } else {
      return 'bottom: 150px;'
    }
  }

  getLegendStyle(): string {
    if (this.appState.viewHeight < this.appState.viewWidth) {
      let height = Math.floor(this.appState.viewHeight / 4);
      if (height > 149) {
        height = 149;
      }
      return `height: ${height}px;`;
    } else {
      return 'height: 149px;'
    }
  }
}
