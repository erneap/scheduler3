import { Injectable } from '@angular/core';
import { IngestResponse } from '../models/web/siteWeb';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { QueryRequest } from '../models/web/teamWeb';

@Injectable({
  providedIn: 'root'
})
export class QueryService {

  constructor(
    protected http: HttpClient
  ) { }

  getBasic(teamid: string): Observable<IngestResponse> {
    const url = `/api/v2/query/${teamid}`;
    return this.http.get<IngestResponse>(url);
  }

  getQuery(teamid: string, hours: number, 
    specialties: number[]): Observable<IngestResponse> {
      const url = `/api/v2/query`;
    const data: QueryRequest = {
      teamid: teamid,
      hours: hours,
      specialties: specialties
    };
    return this.http.post<IngestResponse>(url, data)
  }
}
