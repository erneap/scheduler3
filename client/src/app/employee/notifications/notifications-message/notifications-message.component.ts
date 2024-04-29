import { Component, EventEmitter, Input, Output } from '@angular/core';
import { INotification, Notification } from 'src/app/models/employees/notification';
import { AppStateService } from 'src/app/services/app-state.service';

@Component({
  selector: 'app-notifications-message',
  templateUrl: './notifications-message.component.html',
  styleUrls: ['./notifications-message.component.scss']
})
export class NotificationsMessageComponent {
  private _msg: Notification | undefined;
  private _msgstyle: string = "even";
  @Input() 
  public set message(msg: INotification) {
    this._msg = new Notification(msg);
  }
  get message(): Notification {
    if (!this._msg) {
      return new Notification()
    }
    return this._msg;
  }
  @Input()
  public set messageStyle(style: string) {
    this._msgstyle = style;
  }
  get messageStyle(): string {
    return this._msgstyle;
  }
  @Output() checkChanged = new EventEmitter<string>();

  constructor(
    protected stateService: AppStateService
  ) { }

  onCheck() {
    this.message.checked = !this.message.checked;
    const resp = `${this.message.id}|${this.message.checked}`;
    this.checkChanged.emit(resp);
  }

  msgDate(): string {
    let answer = "";
    if (this._msg) {
      answer = `${this._msg.date.getMonth() + 1}/${this._msg.date.getDate()}/`
        + `${this._msg.date.getFullYear()} `
      if (this._msg.date.getHours() < 10) {
        answer += `0${this._msg.date.getHours()}:`
      } else {
        answer += `${this._msg.date.getHours()}:`
      }
      if (this._msg.date.getMinutes() < 10) {
        answer += `0${this._msg.date.getMinutes()}`;
      } else {
        answer += `${this._msg.date.getMinutes()}`;
      }
    }
    return answer;
  }

  getStyle(): string {
    return `notification ${this.messageStyle}`;
  }

  getDateWidth(): string {
    let ratio = this.stateService.viewWidth / 714;
    if (ratio > 1.0) { ratio = 1.0; }
    const width = Math.floor(155 * ratio);
    return `width: ${width}px;font-size: ${ratio}em;`;
  }

  getMsgWidth(): string {
    let ratio = this.stateService.viewWidth / 714;
    if (ratio > 1.0) { ratio = 1.0; }
    const width = Math.floor(430 * ratio);
    return `width: ${width}px;font-size: ${ratio}em;`;
  }
}
