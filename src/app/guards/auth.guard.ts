import {
  ActivatedRouteSnapshot,
  CanActivateChildFn,
  CanActivateFn,
  CanMatchFn,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree
} from "@angular/router";
import {inject} from "@angular/core";
import {AuthService} from "@services/auth.service";
import {map, take} from "rxjs/operators";
import {Observable} from "rxjs";

export class AuthGuard {
  static canActivate: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    return this.redirectIfNotAuthenticated();
  }

  static canActivateChild: CanActivateChildFn = (childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    return this.redirectIfNotAuthenticated();
  }

  static canMatch: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
    return this.isAuthenticated$();
  }

  private static isAuthenticated$(): Observable<boolean> {
    return inject(AuthService).isAuthenticated$.pipe(take(1));
  }

  private static redirectIfNotAuthenticated(): Observable<boolean | UrlTree> {
    const router = inject(Router);
    return this.isAuthenticated$()
      .pipe(
        map(isLoggedIn => {
          return isLoggedIn ? true : router.parseUrl('login');
        })
      );
  }
}
