import { Component } from '@angular/core';
import { Site } from 'src/app/models/sites/site';
import { AppStateService } from 'src/app/services/app-state.service';

@Component({
    selector: 'app-site-ingest',
    templateUrl: './site-ingest.component.html',
    styleUrls: ['./site-ingest.component.scss'],
    standalone: false
})
export class SiteIngestComponent {
  constructor(
    protected appState: AppStateService
  ) {}

  getCalendarStyle(): string {
    if (this.appState.viewHeight < this.appState.viewWidth) {
      let height = Math.floor(this.appState.viewHeight / 4);
      if (height > 100) {
        height = 100;
      }
      return `bottom: ${height}px;`;
    } else {
      return 'bottom: 150px;'
    }
  }

  getLegendStyle(): string {
    if (this.appState.viewHeight < this.appState.viewWidth) {
      let height = Math.floor(this.appState.viewHeight / 4);
      if (height > 99) {
        height = 99;
      }
      return `height: ${height}px;`;
    } else {
      return 'height: 149px;'
    }
  }
}
