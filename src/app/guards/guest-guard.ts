import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthService} from '@services/auth.service';
import {map} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {ConfigurationService} from "@services/configuration.service";

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  constructor(private authService: AuthService, private configService: ConfigurationService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.authService.isAuthenticated$.pipe(
      map((authenticated) => {
        // return authenticated ? this.router.parseUrl('home') : true;
        if (authenticated) {
          this.router.parseUrl('home');
          return false;
        } else {
          if (route.data.isLoginPage) {
            return this.isCorrectNavigationByLoginInstance(state);
          }
          return true;
        }
      })
    );
  }

  private isCorrectNavigationByLoginInstance(state: RouterStateSnapshot): boolean {
    if (this.configService.isExternalLoginInstance()) {
      if (state.url === '/login') {
        this.router.navigate(['login-external']).then();
        return false;
      }
    } else if (this.configService.isInternalLoginInstance()) {
      if (state.url === '/login-external') {
        this.router.navigate(['login']).then();
        return false;
      }
    }
    return true;
  }

}
