import { Component, EventEmitter, Output } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AppStateService } from 'src/app/services/app-state.service';
import { AuthService } from 'src/app/services/auth.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { MessageService } from 'src/app/services/message.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Output() sidenav = new EventEmitter<any>();

  constructor(
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    protected appState: AppStateService,
    protected authService: AuthService,
    protected empService: EmployeeService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected msgService: MessageService,
    private router: Router
  ) {
    iconRegistry.addSvgIcon('calendar',
      sanitizer.bypassSecurityTrustResourceUrl(
        'assets/images/icons/calendar.svg'));
  }

  viewLogin(): void {
    this.router.navigateByUrl('/login');
  }

  logout() {
    this.siteService.clearSite();
    this.teamService.clearTeam();
    this.authService.setWebLabel('','');
    this.msgService.clearMessages();
    this.empService.clearRenewal();
    this.siteService.stopAutoUpdate();
    this.authService.logout();
  }

  toggle() {
    this.appState.toggle();
  }

  getHelp() {
    let url = '/scheduler/help/index.html';
    window.open(url, "help_win");
  }
}
