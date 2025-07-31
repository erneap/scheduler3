import { Component } from '@angular/core';
import { Site } from 'src/app/models/sites/site';
import { Workcenter } from 'src/app/models/sites/workcenter';
import { AppStateService } from 'src/app/services/app-state.service';
import { SiteService } from 'src/app/services/site.service';

@Component({
    selector: 'app-employee-schedule',
    templateUrl: './employee-schedule.component.html',
    styleUrls: ['./employee-schedule.component.scss'],
    standalone: false
})
export class EmployeeScheduleComponent {
  workcenters: Workcenter[] = []

  constructor(
    protected siteService: SiteService,
    protected appState: AppStateService
  ) {
    const iSite = this.siteService.getSite();
    if (iSite) {
      const site = new Site(iSite);
      this.workcenters = [];
      if (site.workcenters) {
        site.workcenters.forEach(wc => {
          this.workcenters.push(new Workcenter(wc));
        })
      }
      this.workcenters.sort((a,b) => a.compareTo(b));
    }
  }

  viewClass(): string {
    if (this.appState.isMobile() || this.appState.isTablet()) {
      return "flexlayout column topleft";
    }
    return "fxLayout flexlayout column topleft";
  }

  cardClass(): string {
    if (this.appState.isMobile() || this.appState.isTablet()) {
      return "background-color: #673ab7;color: white; width: 100%;";
    }
    return "background-color: #673ab7;color: white;";
  }

  getWidth(): number {
    let ratio = this.appState.viewWidth / 778; 
    if (ratio > 1.0) {
      ratio = 1.0;
    }
    return Math.floor(714 * ratio);
  }
}
