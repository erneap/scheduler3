import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Employee, IEmployee } from '../models/employees/employee';
import { ISite, Site } from '../models/sites/site';
import { IUser, User } from '../models/users/user';
import { NewSiteRequest, NewSiteWorkcenter, SiteResponse, SiteWorkcenterUpdate,
  NewWorkcenterPosition, WorkcenterPositionUpdate, CreateSiteForecast,
  UpdateSiteForecast, 
  UpdateSiteLaborCode,
  NewCofSReport,
  UpdateCofSReport,
  SiteWorkResponse} 
  from '../models/web/siteWeb';
import { CacheService } from './cache.service';
import { NewSiteLaborCode } from '../models/web/siteWeb';
import { AuthService } from './auth.service';
import { ITeam } from '../models/teams/team';

@Injectable({
  providedIn: 'root'
})
export class SiteService extends CacheService {
  interval: any;

  constructor(
    protected httpClient: HttpClient,
    protected authService: AuthService
  ) 
  {
    super();
  }

  getSite(): Site | undefined {
    const iSite = this.getItem<ISite>('current-site');
    if (iSite) {
      return new Site(iSite);
    }
    return undefined;
  }

  clearSite(): void {
    this.removeItem('current-site');
  }

  setSite(isite: ISite): void {
    const site = new Site(isite);
    this.setItem('current-site', site);
  }

  setSiteWork(teamid: string, siteid: string, work: SiteWorkResponse) {
    const key = `work-${teamid}-${siteid}-${work.year}`;
    this.setItem(key, work);
  }

  getSiteWork(teamid: string, siteid: string, year: number): 
    SiteWorkResponse | undefined {
    const key = `work-${teamid}-${siteid}-${year}`;
    return this.getItem<SiteWorkResponse>(key);
  }

  getSelectedEmployee(): Employee | undefined {
    const iEmp = this.getItem<IEmployee>('selected-employee');
    if (iEmp) {
      return new Employee(iEmp);
    }
    return undefined;
  }

  setSelectedEmployee(iEmp: IEmployee): void {
    const emp = new Employee(iEmp);
    this.setItem('selected-employee', emp);
  }

  getExpanded(): string[] {
    const expanded = this.getItem<string>('expanded')
    if (expanded) {
      let exArray: string[] = JSON.parse(expanded);
      return exArray;
    }
    return [];
  }

  setExpanded(exArray: string[]): void {
    let expanded = JSON.stringify(exArray);
    this.setItem('expanded', expanded);
  }

  startAutoUpdates() {
    if (this.interval && this.interval !== null) {
      clearInterval(this.interval);
    }
    let minutes = 15;
    const iUser = this.authService.getUser();
    if (iUser) {
      const user = new User(iUser);
      if (user.isInGroup("scheduler","scheduler") 
        || user.isInGroup("scheduler", "siteleader")) {
        minutes = 3;
      }
    }
    this.interval = setInterval(() => {
      this.processAutoUpdate()
    }, minutes * 60 * 1000);
  }

  processAutoUpdate() {
    console.log("Processing Site Auto Update");
    const iUser = this.authService.getUser();
    if (iUser) {
      const user = new User(iUser);
      if (user.isInGroup("scheduler","scheduler") 
        || user.isInGroup("scheduler", "siteleader")) {
        const team = this.getItem<ITeam>('current-team');
        const site = this.getSite();
        if (team && site) {
          this.retrieveSite(team.id, site.id, true).subscribe({
            next: (data: SiteResponse) => {
              if (data && data !== null && data.site) {
                this.setSite(data.site);
              }
            },
            error: err => {
              this.authService.statusMessage = "Error retrieving site update: "
                + err.exception;
            }
          })
        }
      }
    }
  }

  stopAutoUpdate() {
    if (this.interval && this.interval !== null) {
      clearInterval(this.interval);
    }
  }

  AddSite(teamID: string, siteID: string, siteName: string, mids: boolean, offset: number,
    sitelead: IUser, scheduler?: IUser): Observable<SiteResponse> {
    const url = '/api/v2/scheduler/site';
    const data: NewSiteRequest = {
      team: teamID,
      siteid: siteID,
      name: siteName,
      mids: mids,
      offset: offset,
      lead: sitelead,
    }
    if (scheduler) {
      data.scheduler = scheduler;
    }
    return this.httpClient.post<SiteResponse>(url, data);
  }

  UpdateSite(teamID: string, siteID: string, siteName: string, mids: boolean, 
  offset: number): Observable<SiteResponse> {
    const url = '/api/v2/scheduler/site';
    const data: NewSiteRequest = {
      team: teamID,
      siteid: siteID,
      name: siteName,
      mids: mids,
      offset: offset,
      lead: new User(),
    }
    return this.httpClient.put<SiteResponse>(url, data);
  }

  retrieveSite(teamID: string, siteID: string, allemployees: boolean): 
    Observable<SiteResponse> {
    const url = `/api/v2/scheduler/site/${teamID}/${siteID}/${allemployees}`;
    return this.httpClient.get<SiteResponse>(url);
  }

  retrieveSiteWork(teamID: string, siteID: string, year: number):
    Observable<SiteWorkResponse> {
      const url = `/api/v2/scheduler/site/work/${teamID}/${siteID}/${year}`;
      return this.httpClient.get<SiteWorkResponse>(url);
    }

  deleteSite(teamID: string, siteID: string): Observable<SiteResponse> {
    const url = `/api/v2/scheduler/site/${teamID}/${siteID}`;
    return this.httpClient.delete<SiteResponse>(url);
  }

  //////////////////////////////////////////////////////////////////////////////
  /// Workcenter CRUD actions
  /// - Retrieve - workcenters are passed as part of the site object and 
  ///   response.
  /// - Add
  /// - Update
  /// - Delete
  //////////////////////////////////////////////////////////////////////////////
  addWorkcenter(teamID: string, siteID: string, wkCtrID: string, name: string):
    Observable<SiteResponse> {
    const url = "/api/v2/scheduler/site/workcenter";
    const data: NewSiteWorkcenter = {
      team: teamID,
      siteid: siteID,
      wkctrid: wkCtrID,
      name: name,
    };
    return this.httpClient.post<SiteResponse>(url, data);
  }

  updateWorkcenter(teamID: string, siteID: string, wkCtrID: string, 
    field: string, value: string): Observable<SiteResponse> {
    const url = "/api/v2/scheduler/site/workcenter";
    const data: SiteWorkcenterUpdate = {
      team: teamID,
      siteid: siteID,
      wkctrid: wkCtrID,
      field: field,
      value: value,
    }
    return this.httpClient.put<SiteResponse>(url, data);
  }

  deleteWorkcenter(teamID: string, siteID: string, wkCtrID: string): 
    Observable<SiteResponse> {
    const url = `/api/v2/scheduler/site/workcenter/${teamID}/${siteID}/${wkCtrID}`;
    return this.httpClient.delete<SiteResponse>(url);
  }

  addWorkcenterShift(teamID: string, siteID: string, wkctrID: string, shiftID: string,
    shiftName: string): Observable<SiteResponse> {
    const data: NewWorkcenterPosition = {
      team: teamID,
      siteid: siteID,
      wkctrid: wkctrID,
      positionid: shiftID,
      name: shiftName,
    }
    const url = '/api/v2/scheduler/site/workcenter/shift';
    return this.httpClient.post<SiteResponse>(url, data);
  }

  updateWorkcenterShift(teamID: string, siteID: string, wkctrID: string, 
    shiftID: string, field: string, value: string): 
    Observable<SiteResponse> {
    const url = '/api/v2/scheduler/site/workcenter/shift';
    const data: WorkcenterPositionUpdate = {
      team: teamID,
      siteid: siteID,
      wkctrid: wkctrID,
      positionid: shiftID,
      field: field,
      value: value,
    }
    return this.httpClient.put<SiteResponse>(url, data);
  }

  deleteWorkcenterShift(teamID: string, siteID: string, wkctrID: string, 
  shiftID: string): Observable<SiteResponse> {
    const url = `/api/v2/scheduler/site/workcenter/shift/${teamID}/${siteID}/`
      + `${wkctrID}/${shiftID}`;
    return this.httpClient.delete<SiteResponse>(url);
  }
  
  addWorkcenterPosition(teamID: string, siteID: string, wkctrID: string, posID: string,
    posName: string): Observable<SiteResponse> {
    const data: NewWorkcenterPosition = {
      team: teamID,
      siteid: siteID,
      wkctrid: wkctrID,
      positionid: posID,
      name: posName,
    }
    const url = '/api/v2/scheduler/site/workcenter/position';
    return this.httpClient.post<SiteResponse>(url, data);
  }

  updateWorkcenterPosition(teamID: string, siteID: string, wkctrID: string, 
    posID: string, field: string, value: string): 
    Observable<SiteResponse> {
    const url = '/api/v2/scheduler/site/workcenter/position';
    const data: WorkcenterPositionUpdate = {
      team: teamID,
      siteid: siteID,
      wkctrid: wkctrID,
      positionid: posID,
      field: field,
      value: value,
    }
    return this.httpClient.put<SiteResponse>(url, data);
  }

  deleteWorkcenterPosition(teamID: string, siteID: string, wkctrID: string, 
  posID: string): Observable<SiteResponse> {
    const url = `/api/v2/scheduler/site/workcenter/position/${teamID}/${siteID}/`
      + `${wkctrID}/${posID}`;
    return this.httpClient.delete<SiteResponse>(url);
  }

  addForecastReport(teamid: string, siteid: string, company: string, 
    name: string, start: Date, 
    end: Date, period: number): Observable<SiteResponse> {
    const url = '/api/v2/scheduler/site/forecast';
    const data: CreateSiteForecast = {
      team: teamid,
      siteid: siteid,
      companyid: company,
      name: name,
      startdate: start,
      enddate: end,
      period: period,
    }
    return this.httpClient.post<SiteResponse>(url, data);
  }

  updateForecastReport(teamid: string, siteid: string, reportid: number, 
    field: string, value: string): Observable<SiteResponse> {
    const url = '/api/v2/scheduler/site/forecast';
    const data: UpdateSiteForecast = {
      team: teamid,
      siteid: siteid,
      reportid: reportid,
      field: field,
      value: value,
    }
    return this.httpClient.put<SiteResponse>(url, data);
  }

  deleteForecastReport(teamid: string, siteid: string, reportid: number):
    Observable<SiteResponse> {
    const url = `/api/v2/scheduler/site/forecast/${teamid}/${siteid}/${reportid}`;
    return this.httpClient.delete<SiteResponse>(url);
  }

  createReportLaborCode(teamid: string, siteid: string, reportid: number,
    chargeNumber: string, extension: string, clin: string, slin: string,
    wbs: string, location: string, mins: number, hours: number, noname: string,
    exercise: boolean, start: string, end: string):
    Observable<SiteResponse> {
    const url = '/api/v2/scheduler/site/forecast/laborcode';
    const data: NewSiteLaborCode = {
      team: teamid,
      siteid: siteid,
      reportid: reportid,
      chargeNumber: chargeNumber,
      extension: extension,
      clin: clin,
      slin: slin,
      location: location,
      wbs: wbs,
      minimumEmployees: `${mins}`,
      hoursPerEmployee: `${hours}`,
      notAssignedName: noname,
      exercise: (exercise) ? 'true' : 'false',
      startDate: start,
      endDate: end,
    };
    return this.httpClient.post<SiteResponse>(url, data)
  }

  updateReportLaborCode(teamid: string, siteid: string, reportid: number,
    chargeNumber: string, extension: string, field: string, value: string):
    Observable<SiteResponse> {
    const url = '/api/v2/scheduler/site/forecast/laborcode';
    const data: UpdateSiteLaborCode = {
      team: teamid,
      siteid: siteid,
      reportid: reportid,
      chargeNumber: chargeNumber,
      extension: extension,
      field: field,
      value: value,
    };
    return this.httpClient.put<SiteResponse>(url, data);
  }

  createCofSReport(teamid: string, siteid: string, 
    name: string, shortname: string, unit: string, startdate: Date, 
    enddate: Date): Observable<SiteResponse> {
    const url = '/api/v2/scheduler/site/cofs';
    const data: NewCofSReport = {
      teamid: teamid,
      siteid: siteid,
      rptname: name,
      shortname: shortname,
      unit: unit,
      startdate: startdate,
      enddate: enddate,
    };
    return this.httpClient.post<SiteResponse>(url, data);
  }

  updateCofSReport(teamid: string, siteid: string, 
    rptid: number, field: string, value: string, 
    companyid?: string, ): Observable<SiteResponse> {
    const url = '/api/v2/scheduler/site/cofs';
    const data: UpdateCofSReport = {
      teamid: teamid,
      siteid: siteid,
      rptid: rptid,
      field: field,
      value: value,
    };
    if (companyid) {
      data.companyid = companyid;
    }
    return this.httpClient.put<SiteResponse>(url, data);
  }

  deleteCofSReport(teamid: string, siteid: string, 
    rptid: number): Observable<SiteResponse> {
    const url = `/api/v2/scheduler/site/cofs/${teamid}/`
      + `${siteid}/${rptid}`;
    return this.httpClient.delete<SiteResponse>(url);
  }
}
