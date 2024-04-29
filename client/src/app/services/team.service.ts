import { Injectable } from '@angular/core';
import { CacheService } from './cache.service';
import { ITeam, Team } from '../models/teams/team';
import { ISite, Site } from '../models/sites/site';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SiteResponse } from '../models/web/siteWeb';
import { AddTypeRequest, CreateTeamCompany, CreateTeamRequest, CreateTeamWorkcodeRequest, TeamsResponse, UpdateTeamRequest, UpdateTypeRequest } from '../models/web/teamWeb';
import { CreateCompanyHoliday } from '../models/web/teamWeb';
import { IUser } from '../models/users/user';
import { AuthService } from './auth.service';
import { DialogService } from './dialog-service.service';

@Injectable({
  providedIn: 'root'
})
export class TeamService extends CacheService {
  constructor(protected httpClient: HttpClient,
    protected authService: AuthService,
    protected dialogService: DialogService) {
    super();
  }

  getTeam(): Team | undefined{
    const iTeam = this.getItem<ITeam>('current-team');
    if (iTeam) {
      return new Team(iTeam);
    }
    return undefined;
  }

  clearTeam(): void {
    this.removeItem('current-team');
  }

  setTeam(iteam: ITeam) {
    const team = new Team(iteam);
    this.setItem('current-team', team);
  }

  setSelectedSite(isite: ISite) {
    const site = new Site(isite);
    const iSite = this.getItem<ISite>(site.id);
    this.setItem(site.id, site);
  }

  getSelectedSite(siteid: string) : ISite | undefined {
    const iSite = this.getItem<ISite>(siteid);
    if (iSite) {
      return iSite;
    }
    return undefined;
  }

  retrieveSelectedSite(teamid: string, siteid: string): Observable<SiteResponse> {
    const url = `/api/v2/scheduler/site/${teamid}/${siteid}/true`;
    return this.httpClient.get<SiteResponse>(url);
  }

  addTeam(title: string, workcodes: boolean, leader: IUser): 
    Observable<SiteResponse> {
    const url = '/api/v2/scheduler/team';
    const data: CreateTeamRequest = {
      name: title,
      useStdWorkcodes: workcodes,
      leader: leader,
    }
    return this.httpClient.post<SiteResponse>(url, data);
  }

  updateTeam(teamid: string, name: string): Observable<SiteResponse> {
    const url = '/api/v2/scheduler/team'
    const data: UpdateTeamRequest = {
      teamid: teamid,
      value: name,
    }
    return this.httpClient.put<SiteResponse>(url, data);
  }

  deleteTeam(teamid: string): Observable<TeamsResponse> {
    const url = `/api/v2/scheduler/admin/teams/${teamid}`;
    return this.httpClient.delete<TeamsResponse>(url);
  }

  addTeamWorkcode(team: string, workcode: string, title: string, start: number,
  isLeave: boolean, premimum: string, text: string, back: string, alt: string, 
  search?: string): Observable<SiteResponse> {
    if (!search) {
      search = '';
    }
    const url = '/api/v2/scheduler/team/workcode';
    const data: CreateTeamWorkcodeRequest = {
      teamid: team,
      id: workcode,
      title: title,
      start: start,
      shiftCode: premimum,
      altcode: alt,
      search: search,
      isLeave: isLeave,
      textcolor: text,
      backcolor: back,
    }
    return this.httpClient.post<SiteResponse>(url, data);
  }

  updateTeamWorkcode(team: string, workcode: string, field: string, 
  value: string): Observable<SiteResponse> {
    const url = '/api/v2/scheduler/team/workcode/';
    const data: UpdateTeamRequest = {
      teamid: team,
      additionalid: workcode,
      field: field,
      value: value,
    }
    return this.httpClient.put<SiteResponse>(url, data);
  }
  
  deleteTeamWorkcode(team: string, workcode: string): 
    Observable<SiteResponse> {
    const url = `/api/v2/scheduler/team/workcode/${team}/${workcode}`;
    return this.httpClient.delete<SiteResponse>(url);
  }

  addTeamCompany(team: string, companyid: string, name: string, ingest: string):
  Observable<SiteResponse> {
    const url = '/api/v2/scheduler/team/company';
    const data: CreateTeamCompany = {
      teamid: team,
      id: companyid,
      name: name,
      ingest: ingest,
    }
    return this.httpClient.post<SiteResponse>(url, data);
  }

  updateTeamCompany(team: string, companyid: string, field: string, value: string):
    Observable<SiteResponse> {
    const url = '/api/v2/scheduler/team/company';
    const data: UpdateTeamRequest = {
      teamid: team,
      additionalid: companyid,
      field: field,
      value: `${value}`,
    }
    return this.httpClient.put<SiteResponse>(url, data);
  }
  
  deleteTeamCompany(team: string, company: string): 
    Observable<SiteResponse> {
    const url = `/api/v2/scheduler/team/company/${team}/${company}`;
    return this.httpClient.delete<SiteResponse>(url);
  }

  addTeamCompanyHoliday(team: string, company: string, holtype: string, 
    name: string, actual: string): Observable<SiteResponse> {
    const url = '/api/v2/scheduler/team/company/holiday';
    const data: CreateCompanyHoliday = {
      teamid: team,
      companyid: company,
      holidayid: holtype,
      name: name,
      actual: actual,
    }
    return this.httpClient.post<SiteResponse>(url, data);
  }

  updateTeamCompanyHoliday(team: string, companyid: string, holiday: string, 
    field: string, value: string): Observable<SiteResponse> {
    const url = '/api/v2/scheduler/team/company/holiday';
    const data: UpdateTeamRequest = {
      teamid: team,
      additionalid: companyid,
      holiday: holiday,
      field: field,
      value: `${value}`,
    }
    return this.httpClient.put<SiteResponse>(url, data);
  }

  deleteTeamCompanyHoliday(team: string, company: string, holiday: string): 
    Observable<SiteResponse> {
    const url = `/api/v2/scheduler/team/company/holiday/${team}/${company}`
      + `/${holiday}`;
    return this.httpClient.delete<SiteResponse>(url);
  }

  getTeams(): Observable<TeamsResponse> {
    const url = '/api/v2/scheduler/admin/teams';
    return this.httpClient.get<TeamsResponse>(url);
  }

  addContactType(team: string, id: number, name: string): 
    Observable<SiteResponse> {
    const url = `/api/v2/scheduler/team/contact`;
    const data: AddTypeRequest = {
      teamid: team,
      id: id,
      name: name,
    };
    return this.httpClient.post<SiteResponse>(url, data);
  }

  updateContactType(team: string, id: number, field: string, 
    value: string): Observable<SiteResponse> {
    const url = `/api/v2/scheduler/team/contact`;
    const data: UpdateTypeRequest = {
      teamid: team,
      id: id,
      field: field,
      value: value,
    }
    return this.httpClient.put<SiteResponse>(url, data);
  }

  deleteContactType(team: string, id: number): Observable<SiteResponse> {
    const url = `/api/v2/scheduler/team/contact/${team}/${id}`;
    return this.httpClient.delete<SiteResponse>(url);
  }

  addSpecialtyType(team: string, id: number, name: string): 
    Observable<SiteResponse> {
    const url = `/api/v2/scheduler/team/specialty`;
    const data: AddTypeRequest = {
      teamid: team,
      id: id,
      name: name,
    };
    return this.httpClient.post<SiteResponse>(url, data);
  }

  updateSpecialtyType(team: string, id: number, field: string, 
    value: string): Observable<SiteResponse> {
    const url = `/api/v2/scheduler/team/specialty`;
    const data: UpdateTypeRequest = {
      teamid: team,
      id: id,
      field: field,
      value: value,
    }
    return this.httpClient.put<SiteResponse>(url, data);
  }

  deleteSpecialtyType(team: string, id: number): Observable<SiteResponse> {
    const url = `/api/v2/scheduler/team/specialty/${team}/${id}`;
    return this.httpClient.delete<SiteResponse>(url);
  }
}