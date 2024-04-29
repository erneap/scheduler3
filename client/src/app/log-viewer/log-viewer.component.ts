import { Component } from '@angular/core';
import { LogEntry } from '../models/logs/logentry';
import { LogsService } from '../services/logs.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ILogResponse, LogResponse } from '../models/web/internalWeb';
import { DialogService } from '../services/dialog-service.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-log-viewer',
  templateUrl: './log-viewer.component.html',
  styleUrls: ['./log-viewer.component.scss']
})
export class LogViewerComponent {
  logForm: FormGroup
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
      year: [now.getFullYear(), [Validators.required]],
    });
    this.setLogEntries();
  }

  setLogEntries() {
    this.dialogService.showSpinner();
    this.authService.statusMessage = "Processing leave request";
    const portion = this.logForm.value.portion;
    const year = this.logForm.value.year;
      
    this.logService.getLogEntries(portion, year).subscribe({
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
  
  getListStyle(): string {
    const screenHeight = window.innerHeight;
    const screenWidth = window.innerWidth
    let listHeight = screenHeight - 350;
    let listWidth = screenWidth - 500;
    return `height: ${listHeight}px;width: ${listWidth}px;`;
  }
}
