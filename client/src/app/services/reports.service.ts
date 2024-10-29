import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IReportTypeList, ReportListRequest } from '../models/reports/reportType';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  application: string = 'scheduler';

  constructor(
    protected httpClient: HttpClient,
  ) { }

  getReportTypes(): Observable<IReportTypeList> {
    const app = "scheduler";
    const url = `/api/v2/general/reports/types/${app}`;
    return this.httpClient.get<IReportTypeList>(url);
  }

  getReports(typelist: string[], start: Date, end: Date): Observable<IReportTypeList> {
    const data: ReportListRequest = {
      reporttypes: typelist,
      start: start,
      end: end,
    };
    const url = '/api/v2/general/reports/list';
    return this.httpClient.post<IReportTypeList>(url, data);
  }
}
