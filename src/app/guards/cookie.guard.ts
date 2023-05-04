import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {LangService} from '@services/lang.service';
import {ECookieService} from '@services/e-cookie.service';
import {isValidValue} from '@helpers/utils';
import {DialogService} from '@services/dialog.service';
import {NavigationService} from '@services/navigation.service';
import {EmployeeService} from "@services/employee.service";

@Injectable({
  providedIn: 'root'
})
export class CookieGuard implements CanActivate {
  constructor(private langService: LangService,
              private dialogService: DialogService,
              private navigationService: NavigationService,
              private eCookieService: ECookieService,
              private employeeService: EmployeeService,
              private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let cookieKey: string = route.data.cookieKey;
    if (!cookieKey) {
      return false;
    }
    let cookieValue = this.eCookieService.getEObject(cookieKey),
      isValidCookie: boolean;
    if (!!route.data.validateCookie) {
      isValidCookie = route.data.validateCookie(cookieValue);
    } else {
      isValidCookie = isValidValue(cookieValue);
    }

    if (!isValidCookie) {
      this.dialogService.info(this.langService.map.access_denied);
      if (!this.navigationService.currentPath || this.navigationService.currentPath === '/') {
        this.router.navigate([this.employeeService.isExternalUser() ? '/login-external' : '/login']).then();
      }
    }
    return isValidCookie;
  }

}
