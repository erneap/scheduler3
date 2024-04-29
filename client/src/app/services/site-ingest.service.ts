import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IngestChange, IngestResponse, ManualIngestChanges } from '../models/web/siteWeb';

@Injectable({
  providedIn: 'root'
})
export class SiteIngestService {
  constructor(
    protected httpClient: HttpClient
  ) 
  {}

  getIngestEmployees(team: string, site: string, company: string, year: number): 
    Observable<IngestResponse> {
    const url = `/api/v2/scheduler/ingest/${team}/${site}/${company}/${year}`;
    return this.httpClient.get<IngestResponse>(url);
  }

  fileIngest(formdata: FormData): Observable<IngestResponse> {
    const url = '/api/v2/scheduler/ingest/';
    return this.httpClient.post<IngestResponse>(url, formdata);
  }

  manualIngest(team: string, site: string, company: string, changes: IngestChange[]): 
    Observable<IngestResponse> {
    const url = '/api/v2/scheduler/ingest/';
    const data: ManualIngestChanges = {
      teamid: team,
      siteid: site,
      companyid: company,
      changes: changes,
    }
    return this.httpClient.put<IngestResponse>(url, data);
  }
}
