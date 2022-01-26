import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable, of} from 'rxjs';
import {EmployeeService} from "@app/services/employee.service";
import {DialogService} from "@app/services/dialog.service";
import {LangService} from "@app/services/lang.service";
import {ConfigurationService} from "@app/services/configuration.service";
import {CommonUtils} from "@app/helpers/common-utils";
import {switchMap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class ServicesGuard implements CanActivate {
  private itemKey = 'item';
  private route!: ActivatedRouteSnapshot;

  constructor(private empService: EmployeeService,
              private dialogService: DialogService,
              private langService: LangService,
              private configService: ConfigurationService) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    this.route = route;
    let permissionKey: string | string[] = route.data.permissionKey,
      permissionGroup: string = route.data.configPermissionGroup,
      checkAnyPermission: boolean = route.data.checkAnyPermission,
      permissions: string | string[] = '';
    if (CommonUtils.isValidValue(permissionGroup)) {
      // @ts-ignore
      permissions = this.configService.CONFIG[permissionGroup] || '';
    }
    if (CommonUtils.isValidValue(permissionKey)) {
      if (typeof permissionKey === 'string') {
        permissions = permissionKey;
        checkAnyPermission = false;
      } else {
        permissions = (permissionKey.length > 0) ? permissionKey : '';
      }
    }
    const hasPermission = this.empService.checkPermissions(permissions, checkAnyPermission);
    console.log('HERE IN ROUTER');
    // if (!hasPermission) {
    //   this.dialogService.info(this.langService.map.access_denied);
    // }
    return of(hasPermission)
      .pipe(switchMap(value => value ? of(value) : of(this.hasItemParam())));
  }

  // to check if there is item param
  hasItemParam(): boolean {
    return this.route.queryParamMap.has(this.itemKey);
  }
}
