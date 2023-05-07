import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthService} from '@services/auth.service';
import {map} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {ConfigurationService} from "@services/configuration.service";

@Injectable({
  providedIn: 'root'
})
export class GuestOldGuard implements CanActivate {
  constructor(private authService: AuthService, private configService: ConfigurationService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.authService.isAuthenticated$.pipe(
      map((authenticated) => {
        // return authenticated ? this.router.parseUrl('home') : true;
        if (authenticated) {
          return this.router.parseUrl('home');
        } else {
          if (route.data.isLoginPage) {
            return this.isCorrectNavigationByLoginInstance(state);
          }
          return true;
        }
      })
    );
  }

  private isCorrectNavigationByLoginInstance(state: RouterStateSnapshot): boolean | UrlTree {
    if (this.configService.isExternalLoginInstance()) {
      if (state.url === '/login') {
        return this.router.parseUrl('login-external');
      }
    } else if (this.configService.isInternalLoginInstance()) {
      if (state.url === '/login-external') {
        return this.router.parseUrl('login');
      }
    }
    return true;
  }

}
