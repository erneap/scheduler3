import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LogEntry } from '../models/logs/logentry';
import { LogsService } from '../services/logs.service';
import { DialogService } from '../services/dialog-service.service';
import { AuthService } from '../services/auth.service';
import { AppList, ILogList, LogList } from '../models/logs/applist';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent {
  logForm: FormGroup;
  logEntries: LogEntry[] = [];
  portions: string[] = [];

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
    this.dialogService.showSpinner();
    this.logService.getLogs().subscribe({
      next: (list: AppList) => {
        this.dialogService.closeSpinner();
        this.portions = list.list;
      },
      error: (err: AppList) => {
        this.portions = [];
        this.dialogService.closeSpinner();
        this.authService.statusMessage = err.exception;
      }
    })
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
    this.logEntries = [];
    this.logService.getLogEntries(portion, year).subscribe({
      next: (idata: ILogList) => {
        this.dialogService.closeSpinner();
        if (idata.list) {
          idata.list.forEach(entry => {
            this.logEntries.push(new LogEntry(entry));
          });
          this.logEntries.sort((a,b) => b.compareTo(a));
        } else {
          const logentry = new LogEntry({
            id: '',
            entrydate: new Date(),
            application: 'scheduler',
            category: '',
            title: "NO LOG ENTRIES FOR PERIOD/CATEGORY",
            message: '',
            name: ''
          });
          this.logEntries.push(logentry);
        }
        this.authService.statusMessage = `${this.logEntries.length} log entries`;
      },
      error: (err: ILogList) => {
        this.dialogService.closeSpinner();
        this.authService.statusMessage = err.exception;
      }
    });
  }
}
