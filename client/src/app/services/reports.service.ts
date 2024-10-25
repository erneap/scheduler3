import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IReportTypeList } from '../models/reports/reportType';

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
}
