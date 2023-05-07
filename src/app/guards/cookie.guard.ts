import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot} from "@angular/router";
import {inject} from "@angular/core";
import {ECookieService} from "@services/e-cookie.service";
import {DialogService} from "@services/dialog.service";
import {LangService} from "@services/lang.service";
import {NavigationService} from "@services/navigation.service";
import {CommonUtils} from "@helpers/common-utils";
import {EmployeeService} from "@services/employee.service";

export class CookieGuard {
  static canActivate: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    return this.isValidCookie(route);
  }

  private static isValidCookie(route: ActivatedRouteSnapshot): boolean {
    let cookieKey: string = route.data.cookieKey;
    if (!cookieKey) {
      return false;
    }
    const eCookieService = inject(ECookieService);
    const dialogService = inject(DialogService);
    const langService = inject(LangService);
    const navigationService = inject(NavigationService);
    const router = inject(Router);
    const employeeService = inject(EmployeeService);

    let cookieValue = eCookieService.getEObject(cookieKey),
      isValidCookie: boolean;
    if (!!route.data.validateCookie) {
      isValidCookie = route.data.validateCookie(cookieValue);
    } else {
      isValidCookie = CommonUtils.isValidValue(cookieValue);
    }

    if (!isValidCookie) {
      dialogService.info(langService.map.access_denied);
      if (!navigationService.currentPath || navigationService.currentPath === '/') {
        router.navigate([employeeService.isExternalUser() ? '/login-external' : '/login']).then();
      }
    }
    return isValidCookie;
  }
}
