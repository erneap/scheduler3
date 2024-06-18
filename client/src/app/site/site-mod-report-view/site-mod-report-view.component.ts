import { Component } from '@angular/core';
import { AppStateService } from 'src/app/services/app-state.service';

@Component({
  selector: 'app-site-mod-report-view',
  templateUrl: './site-mod-report-view.component.html',
  styleUrls: ['./site-mod-report-view.component.scss']
})
export class SiteModReportViewComponent {
  width: number = 960;

  constructor(
    protected stateService: AppStateService
  ) {

    this.width = this.stateService.viewWidth - (this.stateService.showMenu ? 270 : 20);
  }

  setWidth(): string {
    return `width: ${this.width}px;`;
  }
}
