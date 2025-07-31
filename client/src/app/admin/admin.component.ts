import { Component } from '@angular/core';
import { AppStateService } from '../services/app-state.service';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
    standalone: false
})
export class AdminComponent {
  constructor(
    protected appState: AppStateService
  ) {
    this.appState.setShowMenu(false);
  }
}
