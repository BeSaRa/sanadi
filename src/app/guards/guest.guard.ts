import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree} from "@angular/router";
import {inject} from "@angular/core";
import {AuthService} from "@services/auth.service";
import {map} from "rxjs/operators";
import {ConfigurationService} from "@services/configuration.service";

export class GuestGuard {
  private static data: {
    router: Router,
    configService: ConfigurationService
  } = {} as any;

  static canActivate: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    this.data.router = inject(Router);
    this.data.configService = inject(ConfigurationService);

    return inject(AuthService).isAuthenticated$.pipe(
      map((authenticated) => {
        // return authenticated ? this.router.parseUrl('home') : true;
        if (authenticated) {
          return this.data.router.parseUrl('home');
        } else {
          if (route.data.isLoginPage) {
            return this.isCorrectNavigationByLoginInstance(state);
          }
          return true;
        }
      })
    );
  }

  private static isCorrectNavigationByLoginInstance(state: RouterStateSnapshot): boolean | UrlTree {
    if (this.data.configService.isExternalLoginInstance()) {
      if (state.url === '/login') {
        return this.data.router.parseUrl('login-external');
      }
    } else if (this.data.configService.isInternalLoginInstance()) {
      if (state.url === '/login-external') {
        return this.data.router.parseUrl('login');
      }
    }
    return true;
  }
}
