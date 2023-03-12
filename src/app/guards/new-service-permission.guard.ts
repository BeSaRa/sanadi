import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable, of} from 'rxjs';
import {CommonUtils} from '@helpers/common-utils';
import {PermissionGroupsEnum} from '@app/enums/permission-groups-enum';
import {INavigatedItem} from '@contracts/inavigated-item';
import {EmployeeService} from '@services/employee.service';
import {DialogService} from '@services/dialog.service';
import {LangService} from '@services/lang.service';
import {EncryptionService} from '@services/encryption.service';
import {StaticAppResourcesService} from '@services/static-app-resources.service';
import {switchMap, tap} from 'rxjs/operators';
import {CaseTypes} from '@app/enums/case-types.enum';
import {ICustomRouteData} from '@contracts/i-custom-route-data';

@Injectable({
  providedIn: 'root'
})
export class NewServicePermissionGuard implements CanActivate {
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
    const hasPermission = this._hasPermission(route, route.data as ICustomRouteData);
    return of(hasPermission)
      .pipe(switchMap(value => value ? of(value) : of((this.hasItemParam() && this.validItem()))))
      .pipe(tap(hasPermission => !hasPermission ? this.dialogService.info(this.langService.map.access_denied) : null));
  }

  private _hasPermission(route: ActivatedRouteSnapshot, routeData: ICustomRouteData): boolean {
    let permissionKey: string | string[] = routeData.permissionKey ?? [],
      permissionGroup: string = routeData.permissionGroup ?? '',
      checkAnyPermission: boolean = routeData.checkAnyPermission,
      permissions: string | string[] = '';
    const caseType: CaseTypes = route.data.caseType;

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
    return this.empService.checkPermissions(permissions, checkAnyPermission);
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
