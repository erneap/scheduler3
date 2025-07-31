import { Component, Input } from '@angular/core';
import { LogEntry } from 'src/app/models/logs/logentry';

@Component({
    selector: 'app-log-entry',
    templateUrl: './log-entry.component.html',
    styleUrls: ['./log-entry.component.scss'],
    standalone: false
})
export class LogEntryComponent {
  private _entry: LogEntry = new LogEntry();
  @Input() 
  public set entry(e: LogEntry) {
    this._entry = new LogEntry(e);
  }
  get entry(): LogEntry {
    return this._entry;
  }
  @Input() nth: number = 0;

  constructor() {}

  dateTime(): string {
    let answer = "";
    if (this.entry.entrydate.getUTCMonth() < 9) {
      answer += "0";
    }
    answer += `${this.entry.entrydate.getUTCMonth() + 1}/`;
    if (this.entry.entrydate.getUTCDate() < 10) {
      answer += "0";
    }
    answer += `${this.entry.entrydate.getUTCDate()}`
      + `/${this.entry.entrydate.getUTCFullYear()} `;
    if (this.entry.entrydate.getHours() < 10) {
      answer += "0";
    }
    answer += `${this.entry.entrydate.getHours()}`;
    if (this.entry.entrydate.getMinutes() < 10) {
      answer += "0";
    }
    answer += `${this.entry.entrydate.getMinutes()}Z`;
    return answer;
  }

  cellStyle(): string {
    if (this.nth % 2 === 0) {
      return 'background-color: #c5b1e7;color: black;';
    }
    return 'background-color: white;color: black;';
  }
}
