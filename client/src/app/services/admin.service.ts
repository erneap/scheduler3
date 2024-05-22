import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TeamsResponse } from '../models/web/teamWeb';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(
    private http: HttpClient
  ) { }

  purgeData(date: Date): Observable<TeamsResponse> {
    let sDate = `${date.getFullYear()}`;
    if (date.getMonth() < 9) {
      sDate += "0";
    }
    sDate += `${date.getMonth() + 1}`;
    if (date.getDate() < 10) {
      sDate += '0';
    }
    sDate += `${date.getDate()}`;
    const url = `/scheduler/api/v2/admin/purge/${sDate}`;
    return this.http.delete<TeamsResponse>(url);
  }
}
