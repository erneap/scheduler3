import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { SiteService } from './services/site.service';
import { TeamService } from './services/team.service';
import { MessageService } from './services/message.service';
import { DialogService } from './services/dialog-service.service';
import { EmployeeService } from './services/employee.service';
import { InitialResponse } from './models/web/employeeWeb';
import { Site } from './models/sites/site';
import { HttpResponse } from '@angular/common/http';
import { NotificationResponse } from './models/web/internalWeb';
import { Team } from './models/teams/team';
import { Location } from '@angular/common';
import { AppStateService } from './services/app-state.service';
import { MatSidenav } from '@angular/material/sidenav';
const { version: appVersion } = require('../../package.json');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'client';
  isMobile = false;
  initialUrl: string = '';
  appVersion: string;
  width: number;

  constructor(
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
    protected authService: AuthService,
    protected stateService: AppStateService,
    protected dialogService: DialogService,
    protected empService: EmployeeService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected msgService: MessageService,
    private router: Router,
    private location: Location
  ) {
    this.appVersion = appVersion;
    if (this.location.path() && this.location.path() !== '') {
      this.initialUrl = this.location.path();
    } else {
      this.initialUrl = "/home";
    }
    iconRegistry.addSvgIcon('calendar',
      sanitizer.bypassSecurityTrustResourceUrl(
        'assets/images/icons/calendar.svg'));
    const user = this.authService.getUser();
    if (this.authService.isTokenExpired() || !user) {
      this.router.navigate(['/home']);
    } else {
      this.getInitialData(user.id);
    }
    this.stateService.showMenu = !this.stateService.isMobile();
    this.width = this.stateService.viewWidth;
    if (this.stateService.showMenu) {
      this.width = this.width - 250;
    }
    this.isMobile = this.stateService.isMobile() || this.stateService.isTablet();
  }

  logout() {
    this.siteService.clearSite();
    this.teamService.clearTeam();
    this.authService.setWebLabel('','', this.stateService.viewState);
    this.msgService.clearMessages();
    this.siteService.stopAutoUpdate();
    this.authService.logout();
  }

  getHelp() {
    let url = '/scheduler/help/index.html';
    window.open(url, "help_win");
  }

  getInitialData(id: string) {
    this.authService.statusMessage = "Pulling Initial Data";
    this.dialogService.showSpinner();
    this.authService.initialData(id).subscribe({
      next: (data: InitialResponse) => {
        this.dialogService.closeSpinner();
        let site = "";
        let team = "Scheduler";
        if (data.employee) {
          this.empService.setEmployee(data.employee)
        }
        if (data.site) {
          const oSite = new Site(data.site);
          this.siteService.setSite(oSite);
          site = oSite.name;
        }
        if (data.team) {
          const oTeam = new Team(data.team);
          team = oTeam.name;
          this.teamService.setTeam(oTeam);
        }
        this.authService.setWebLabel(team, site, this.stateService.viewState);
        this.siteService.startAutoUpdates();
        this.getInitialNotifications(id);
      },
      error: (err: InitialResponse) => {
        this.dialogService.closeSpinner();
        this.authService.statusMessage = `Problem getting initial data: ${err.exception}`;
      }
    })
  }

  getInitialNotifications(id: string) {
    this.authService.statusMessage = "Checking for notifications";
    this.dialogService.showSpinner()
    this.msgService.getEmployeeMessages(id).subscribe({
      next: (resp: NotificationResponse) => {
        this.dialogService.closeSpinner();
        this.authService.statusMessage = "Initial Notifications reviewed";
        this.msgService.startAlerts();
        if (resp && resp !== null) {
          if (this.msgService.showAlerts) {
            this.router.navigateByUrl('/notifications');
          } else {
            this.router.navigateByUrl(this.initialUrl);
          }
        }
      },
      error: (err: NotificationResponse) => {
        this.dialogService.closeSpinner();
        this.authService.statusMessage = `Problem getting notification data: `
          + `${err.exception}`;
      }
    })
  }
}