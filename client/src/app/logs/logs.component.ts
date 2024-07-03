import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LogEntry } from '../models/logs/logentry';
import { LogsService } from '../services/logs.service';
import { DialogService } from '../services/dialog-service.service';
import { AuthService } from '../services/auth.service';
import { ILogResponse, LogResponse } from '../models/web/internalWeb';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent {
  logForm: FormGroup;
  logEntries: LogEntry[] = [];
  portionTitles: string[] = new Array("Authentication", "Leave", 
    "Leave Requests", "Debug");
  portions: string[] = new Array("authenticate", "leaves", 
    "leaverequest", "scheduler");

  constructor(
    protected logService: LogsService,
    protected dialogService: DialogService,
    protected authService: AuthService,
    private fb: FormBuilder
  ) {
    const now = new Date();
    this.logForm = this.fb.group({
      portion: ['leaverequest', [Validators.required]],
      year: [now.getUTCFullYear(), [Validators.required]],
      filter: '',
    });
    this.setLogEntries();
  }

  setLogEntries() {
    this.dialogService.showSpinner();
    this.authService.statusMessage = "Processing leave request";
    const portion = this.logForm.value.portion;
    const year = this.logForm.value.year;
    let filter = this.logForm.value.filter;
    if (filter === '') {
      filter = undefined;
    }
      
    this.logService.getLogEntries(portion, year, filter).subscribe({
      next: (idata: ILogResponse) => {
        const data: LogResponse = new LogResponse(idata);
        this.dialogService.closeSpinner();
        this.logEntries = [];
        data.entries.forEach(entry => {
          this.logEntries.push(new LogEntry(entry));
        });
        this.logEntries.sort((a,b) => b.compareTo(a));
        this.authService.statusMessage = `${this.logEntries.length} log entries`;
      },
      error: (err: ILogResponse) => {
        this.logEntries = [];
        this.dialogService.closeSpinner();
        this.authService.statusMessage = err.exception;
      }
    });
  }
}
