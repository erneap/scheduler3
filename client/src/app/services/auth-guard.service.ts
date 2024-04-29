import { Injectable } from '@angular/core';
import {  CanActivate,
          Router,
          ActivatedRouteSnapshot,
          RouterStateSnapshot,
          CanLoad,
          CanActivateChild,
          Route,
          UrlSegment,
          UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {

  constructor(
    protected authService: AuthService,
    protected router: Router,
  ) { }

  canLoad(route: Route, segments: UrlSegment[]): boolean | UrlTree | 
    Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.checkLogin();
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): 
    boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.checkLogin(route);
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean 
    | UrlTree> | Promise<boolean | UrlTree> {
    return this.checkLogin(childRoute);
  }

  protected checkLogin(route?: ActivatedRouteSnapshot) {
    let roleMatch = true;
    let params: any;
    if (route) {
      const expectedRole = route.data['expectedRole'];
      if (expectedRole) {
        roleMatch = this.authService.hasRole(expectedRole)
          || this.authService.hasRole('ADMIN');
      }

      if (roleMatch) {
        params = { redirectUrl: route.pathFromRoot.map( r => r.url.join('/')) }
      }
    }
    if (!this.authService.isAuthenticated || !roleMatch) {
      this.router.navigate(['/home', params || {}])
      return false;
    }
    return true;
  }
}
