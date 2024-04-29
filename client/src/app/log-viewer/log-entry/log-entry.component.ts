import { Component, Input } from '@angular/core';
import { LogEntry } from 'src/app/models/logs/logentry';

@Component({
  selector: 'app-log-entry',
  templateUrl: './log-entry.component.html',
  styleUrls: ['./log-entry.component.scss']
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

  constructor() {}

  dateTime(): string {
    let answer = "";
    if (this.entry.entrydate.getMonth() < 9) {
      answer += "0";
    }
    answer += `${this.entry.entrydate.getMonth() + 1}/`;
    if (this.entry.entrydate.getDate() < 10) {
      answer += "0";
    }
    answer += `${this.entry.entrydate.getDate()}`
      + `/${this.entry.entrydate.getFullYear()} `;
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
}
