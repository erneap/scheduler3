import { Injectable } from '@angular/core';
import { CacheService } from './cache.service';
import { IUser, User } from '../models/users/user';
import { AuthenticationRequest, AuthenticationResponse, ChangePasswordRequest, 
  EmployeeResponse, InitialResponse, UpdateRequest }
  from '../models/web/employeeWeb';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import jwt_decode from 'jwt-decode';
import { ExceptionResponse, PasswordResetRequest, UsersResponse } from '../models/web/userWeb';
import { DialogService } from './dialog-service.service';
import { ViewState } from '../models/state/viewstate';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends CacheService {
  loginError: string = '';
  isAuthenticated = false;
  lastPage = '';
  isScheduler = false;
  isSiteLeader = false;
  isTeamLeader = false;
  isAdmin = false;
  isCompanyLead = false;
  schedulerLabel = "Scheduler";
  section: string = 'employee';
  statusMessage: string = '';
  teamID: string = '';
  siteID: string = '';
  interval: any;

  authStatus = new BehaviorSubject<IAuthStatus>( 
    this.getItem('authStatus') || defaultAuthStatus);

  private readonly authProvider: (email: string, password: string)
    => Observable<AuthenticationResponse>;

  constructor(
    public httpClient: HttpClient,
    protected dialogService: DialogService,
    private router: Router
  ) {
    super();
    this.authStatus.subscribe(authStatus => this.setItem('authStatus', 
      authStatus));
    this.authProvider = this.apiAuthProvider;
  }

  startTokenRenewal() {
    const minutes = 358;
    if (!this.isTokenExpired()) {
      this.interval = setInterval(() => {
        this.processToken()
      }, minutes * 60 * 1000);
    }
  }

  processToken() {
    const url = '/authentication/authenticate';
    const data: AuthenticationRequest = {
      emailAddress: '',
      password: '',
    } 
    this.httpClient.put<AuthenticationResponse>(url, data).subscribe({
      next: (data: AuthenticationResponse) => {
        if (data && data.token) {
          this.setToken(data.token);
        }
      },
      error: (err: AuthenticationResponse) => {
        this.statusMessage = `Error: Token Renewal Exception: ${err.exception}`;
      }
    });
  }

  stopTokenInterval() {
    if (this.interval && this.interval !== null) {
      clearInterval(this.interval);
    }
  }

  private apiAuthProvider(email: string, password: string)
    : Observable<AuthenticationResponse> {
    return this.httpClient.post<AuthenticationResponse>(
      '/api/v2/scheduler/user/logon', 
      { email: email, password: password });
  }

  login(email: string, password: string): Observable<AuthenticationResponse> {
    const url = "/api/v2/authentication/authenticate";
    const data: AuthenticationRequest = {
      emailAddress: email,
      password: password,
    };
    return this.httpClient.post<AuthenticationResponse>(url, data);
  }

  logout() {
    const user = this.getUser()
    if (user) {
      this.dialogService.showSpinner();
      const url = `/api/v2/authentication/authenticate/${user.id}/scheduler`;
      this.httpClient.delete(url).subscribe({
        next: () => {
          this.dialogService.closeSpinner();
          this.clearToken();
          this.stopTokenInterval();
          this.isAuthenticated = false;
          this.setWebLabel("", "");
          this.router.navigate(["/home"]);
        },
        error: (err: ExceptionResponse) => {
          this.dialogService.closeSpinner();
          this.statusMessage = err.exception;
        }
      })
    } else {
      this.clearToken();
      this.stopTokenInterval();
      this.isAuthenticated = false;
      this.setWebLabel("", "");
      this.router.navigate(["/home"]);
    }
  }

  public hasRole(role: string): boolean {
    const user = this.getUser();
    if (user) {
      return user.isInGroup("scheduler", role);
    } else {
      return false;
    }
  }

  public isInRoles(roles: string[]): boolean {
    let answer = false;
    const user = this.getUser();
    if (user) {
      roles.forEach(role => {
        if (user.isInGroup("scheduler", role)) {
          answer = true;
        }
      });
    }
    return answer;
  }

  isTokenExpired(): Boolean {
    const authStatus = this.getDecodedToken();
    return (Math.floor((new Date()).getTime() / 1000)) >= authStatus.exp;
  }

  getDecodedToken(): IAuthStatus {
    const token = this.getItem<string>('jwt');
    if (token) {
      return jwt_decode(token);
    } else {
      return defaultAuthStatus;
    }
  }

  getExpiredDate(): Date {
    return new Date(this.getDecodedToken().exp * 1000);
  }

  getUser(): User | undefined {
    if (!this.isTokenExpired()) {
      const iUser = this.getItem<IUser>('current-user');
      if (iUser) {
        const user = new User(iUser);
        this.isScheduler = user.isInGroup("scheduler", "scheduler");
        this.isSiteLeader = user.isInGroup("scheduler", "siteleader");
        this.isTeamLeader = user.isInGroup("scheduler", "teamleader")
        this.isAdmin = user.isInGroup("scheduler", "admin");
        this.isCompanyLead = user.isInGroup("scheduler", "company");
        this.isAuthenticated = true;
        return user;
      }
    } else {
      this.clearToken()
    }
    return undefined;
  }

  setUser(iUser: IUser) {
    const user = new User(iUser);
    this.isScheduler = user.isInGroup("scheduler", "scheduler");
    this.isSiteLeader = user.isInGroup("scheduler", "sitelead");
    this.isTeamLeader = user.isInGroup("scheduler", "teamlead")
    this.isAdmin = user.isInGroup("scheduler", "admin");
    this.isCompanyLead = user.isInGroup("scheduler", "companylead");
    this.setItem('current-user', user);
  }

  showMenu(): boolean {
    if (this.getUser()) {
      return true;
    }
    return false;
  }
  
  getToken(): string {
    var token: string = this.getItem('jwt') || ''
    if (token !== '') { 
      this.isAuthenticated = true
    }
    return token
  }

  setToken(jwt: string) {
    this.setItem('jwt', jwt);
  }

  clearToken() {
    this.removeItem('jwt');
    this.removeItem('current-user');
    this.removeItem('current-employee');
    this.removeItem('current-site');
    this.removeItem('current-team');
    this.teamID = '';
    this.siteID = '';
  }

  setWebLabel(team: string, site: string, viewState?: ViewState) {
    if (!viewState || viewState === ViewState.Desktop) {
      if (team === "" && site === "") {
        this.schedulerLabel = "Scheduler";
      } else if (site === "") {
        this.schedulerLabel = `${team.toUpperCase()} Scheduler`;
      } else {
        this.schedulerLabel = `${team.toUpperCase()} - ${site.toUpperCase()} Scheduler`;
      }
    } else {
      if (team === "" && site === "") {
        this.schedulerLabel = "Scheduler";
      } else if (site === "") {
        this.schedulerLabel = `${team.toUpperCase()}`;
      } else {
        this.schedulerLabel = `${site.toUpperCase()}`;
      }
    }
  }

  changeUser(id: string, field: string, value: string): 
    Observable<AuthenticationResponse> {
    const url = '/api/v2/authentication/user/changes';
    const data: UpdateRequest = {
      id: id,
      field: field,
      value: value,
    };
    return this.httpClient.put<AuthenticationResponse>(url, data);
  }

  changePassword(id: string, passwd: string): 
    Observable<EmployeeResponse> {
    const url = '/api/v2/authentication/user';
    const data: UpdateRequest = {
      id: id,
      field: "password",
      value: passwd,
    }
    return this.httpClient.put<EmployeeResponse>(url, data);
  }

  startPasswordReset(email: string): Observable<HttpResponse<void>> {
    const url = '/api/v2/authentication/reset';
    const data: AuthenticationRequest = {
      emailAddress: email,
      password: '',
    }
    return this.httpClient.post<HttpResponse<void>>(url, data)
  }

  sendPasswordReset(email: string, passwd: string, token: string)
    : Observable<AuthenticationResponse> {
    const url = '/api/v2/authentication/reset';
    const data: PasswordResetRequest = {
      emailAddress: email,
      password: passwd,
      token: token,
      application: 'scheduler',
    }
    return this.httpClient.put<AuthenticationResponse>(url, data)
  }

  getAllUsers(): Observable<HttpResponse<UsersResponse>> {
    const url = '/api/v2/authentication/user';
    return this.httpClient.get<UsersResponse>(url, {observe: 'response'});
  }

  addUser(user: User): Observable<HttpResponse<UsersResponse>> {
    const url = '/api/v2/authentication/user/'
    return this.httpClient.post<UsersResponse>(url, user, {observe: 'response'});
  }

  initialData(id: string): Observable<InitialResponse> {
    const url = `/api/v2/scheduler/${id}`;
    return this.httpClient.get<InitialResponse>(url);
  }
}

export interface IAuthStatus {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

const defaultAuthStatus = { userId: '', email: '', iat: 0, exp: 0 }
