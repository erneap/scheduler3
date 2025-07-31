import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AppStateService } from 'src/app/services/app-state.service';
import { User } from 'src/app/models/users/user';

@Component({
    selector: 'app-navigation-menu',
    templateUrl: './navigation-menu.component.html',
    styleUrls: ['./navigation-menu.component.scss'],
    standalone: false
})
export class NavigationMenuComponent {
  @Input() user: User | undefined;
  @Output() sidenav = new EventEmitter<any>();
  section: string = 'employee';
  constructor(
    public authService: AuthService,
    protected appState: AppStateService,
    private router: Router
  ) {
    
  }

  isInGroup(role: string): boolean {
    return this.authService.hasRole(role);
  }

  goToLink(url: string) {
    this.router.navigateByUrl(url);
    if (!this.appState.isDesktop()) {
      this.appState.showMenu = !this.appState.showMenu;
      this.sidenav.emit();
    }
  }

  toggle() {
    this.appState.showMenu = !this.appState.showMenu;
    this.sidenav.emit();
  }
}