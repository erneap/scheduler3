import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AddLogEntry, ILogResponse, LogRequest } from '../models/web/internalWeb';
import { AppList, ILogList } from '../models/logs/applist';

@Injectable({
  providedIn: 'root'
})
export class LogsService {

  constructor(
    protected httpClient: HttpClient,
  ) { }

  getLogs(): Observable<AppList> {
    let url = `/api/v2/general/logs/apps`;
      
    return this.httpClient.get<AppList>(url);
  }

  getLogEntries(portion: string, year: number, filter?: string):
    Observable<ILogList> {
    let url = `/api/v2/general/logs/app/${portion}/${year}-01-01/${year}-12-31`;
    return this.httpClient.get<ILogList>(url);
  }
}
