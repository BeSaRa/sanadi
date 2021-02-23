import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {DialogService} from '../services/dialog.service';
import {Injectable} from '@angular/core';
import {EmployeeService} from '../services/employee.service';
import {LangService} from '../services/lang.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionGuard implements CanActivate {
  constructor(private empService: EmployeeService,
              private dialogService: DialogService,
              private langService: LangService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | boolean {
    const hasPermission = this.empService.checkPermissions(route.data.permissionKey, route.data.checkAnyPermission);
    if (!hasPermission) {
      this.dialogService.info(this.langService.map.access_denied);
    }
    return hasPermission;
  }
}
