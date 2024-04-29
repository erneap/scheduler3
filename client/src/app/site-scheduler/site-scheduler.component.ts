import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-site-scheduler',
  template: `
    <router-outlet></router-outlet>
  `,
  styles: [
  ]
})
export class SiteSchedulerComponent {
  constructor(
    protected authService: AuthService
  ) {
    this.authService.section = 'siteschedule'
  }
}
