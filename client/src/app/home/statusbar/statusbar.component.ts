import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { MessageService } from 'src/app/services/message.service';
const { version: appVersion } = require('../../../../package.json');

@Component({
  selector: 'app-statusbar',
  templateUrl: './statusbar.component.html',
  styleUrls: ['./statusbar.component.scss']
})
export class StatusbarComponent {
  appVersion: string = "";

  constructor(
    protected authService: AuthService,
    protected msgService: MessageService
  ) {
    this.appVersion = appVersion;
  }

  goToMetrics() {
    window.location.href = '/metrics';
  }
}
