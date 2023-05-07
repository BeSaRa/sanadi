import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable, of} from 'rxjs';
import {EmployeeService} from '@app/services/employee.service';
import {DialogService} from '@app/services/dialog.service';
import {LangService} from '@app/services/lang.service';
import {CommonUtils} from '@app/helpers/common-utils';
import {switchMap, tap} from 'rxjs/operators';
import {INavigatedItem} from '@app/interfaces/inavigated-item';
import {EncryptionService} from '@app/services/encryption.service';
import {PermissionGroupsEnum} from '@app/enums/permission-groups-enum';
import {StaticAppResourcesService} from '@services/static-app-resources.service';

@Injectable({
  providedIn: 'root'
})
export class ServicesOldGuard implements CanActivate {
  private itemKey = 'item';
  private route!: ActivatedRouteSnapshot;

  constructor(private empService: EmployeeService,
              private dialogService: DialogService,
              private langService: LangService,
              private encrypt: EncryptionService,
              private staticResourcesService: StaticAppResourcesService) {
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
      permissions = this.staticResourcesService.getPermissionsListByGroup(permissionGroup as unknown as PermissionGroupsEnum) || '';
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
    // if (!hasPermission) {
    //   this.dialogService.info(this.langService.map.access_denied);
    // }
    return of(hasPermission)
      .pipe(switchMap(value => value ? of(value) : of((this.hasItemParam() && this.validItem()))))
      .pipe(tap(hasPermission => !hasPermission ? this.dialogService.info(this.langService.map.access_denied) : null));
  }

  // to check if there is item param
  hasItemParam(): boolean {
    return this.route.queryParamMap.has(this.itemKey);
  }

  getItem(): string | null {
    return this.route.queryParamMap.get(this.itemKey);
  }

  validItem(): boolean {
    try {
      this.encrypt.decrypt<INavigatedItem>(this.getItem()!);
      return true;
    } catch (e) {
      return false;
    }
  }
}
