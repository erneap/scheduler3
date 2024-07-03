import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AddLogEntry, ILogResponse, LogRequest } from '../models/web/internalWeb';

@Injectable({
  providedIn: 'root'
})
export class LogsService {

  constructor(
    protected httpClient: HttpClient,
  ) { }

  getLogEntries(portion: string, year: number, filter?: string):
    Observable<ILogResponse> {
    let url = `/api/v2/scheduler/logs/${portion}/${year}`;
    if (filter && filter !== '') {
      const filters = filter.split(',')
      let data: LogRequest = {
        portion: portion,
        year: year,
        filter: filters,
      };
      url = '/api/v2/scheduler/logs/';
      return this.httpClient.put<ILogResponse>(url, data);
    }
    return this.httpClient.get<ILogResponse>(url);
  }

  addLogEntry(portion: string, category: string, title: string, 
    message: string): Observable<ILogResponse> {
    const data: AddLogEntry = {
      portion: portion,
      category: category,
      title: title,
      message: message,
    }
    const url = '/api/v2/scheduler/logs';
    return this.httpClient.post<ILogResponse>(url, data);
  }
}
