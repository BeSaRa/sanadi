import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  CanLoad,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree
} from '@angular/router';
import {AuthService} from '../services/auth.service';
import {Observable} from 'rxjs';
import {DialogService} from '../services/dialog.service';
import {map, take} from 'rxjs/operators';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthOldGuard implements CanActivate, CanLoad, CanActivateChild {
  constructor(private authService: AuthService, private dialogService: DialogService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.redirectIfNotAuthenticated();
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.redirectIfNotAuthenticated();
  }

  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(take(1));
  }

  private redirectIfNotAuthenticated(): Observable<boolean | UrlTree> {
    return this.authService.isAuthenticated$
      .pipe(
        map(isLoggedIn => {
          return isLoggedIn ? true : this.router.parseUrl('login');
        })
      );
  }
}
