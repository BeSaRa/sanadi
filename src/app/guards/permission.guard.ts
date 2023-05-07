import {ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot} from "@angular/router";
import {LangService} from "@services/lang.service";
import {DialogService} from "@services/dialog.service";
import {EmployeeService} from "@services/employee.service";
import {StaticAppResourcesService} from "@services/static-app-resources.service";
import {ICustomRouteData} from "@contracts/i-custom-route-data";
import {of} from "rxjs";
import {tap} from "rxjs/operators";
import {inject} from "@angular/core";
import {CommonUtils} from "@helpers/common-utils";
import {PermissionGroupsEnum} from "@enums/permission-groups-enum";

export class PermissionGuard {
  private static data: {
    langService: LangService,
    dialogService: DialogService,
    employeeService: EmployeeService,
    staticResourcesService: StaticAppResourcesService
  } = {} as any;

  static canActivate: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    this._init();
    const hasPermission = this._hasPermission(route.data as ICustomRouteData);
    return of(hasPermission)
      .pipe(tap(hasPermission => !hasPermission ? this._displayAccessDeniedMessage() : null));
  }

  private static _init(): void {
    this.data.dialogService = inject(DialogService);
    this.data.langService = inject(LangService);
    this.data.employeeService = inject(EmployeeService);
    this.data.staticResourcesService = inject(StaticAppResourcesService);
  }

  private static _hasPermission(routeData: ICustomRouteData): boolean {
    let permissionKey: string | string[] = routeData.permissionKey ?? [],
      permissionGroup: string = routeData.configPermissionGroup ?? '',
      checkAnyPermission: boolean = routeData.checkAnyPermission,
      permissions: string | string[] = '';

    if (CommonUtils.isValidValue(permissionGroup)) {
      permissions = this.data.staticResourcesService.getPermissionsListByGroup(permissionGroup as unknown as PermissionGroupsEnum) || '';
    }
    if (CommonUtils.isValidValue(permissionKey)) {
      if (typeof permissionKey === 'string') {
        permissions = permissionKey;
        checkAnyPermission = false;
      } else {
        permissions = (permissionKey.length > 0) ? permissionKey : '';
      }
    }
    return this.data.employeeService.checkPermissions(permissions, checkAnyPermission);
  }

  private static _displayAccessDeniedMessage() {
    this.data.dialogService.info(this.data.langService.map.access_denied);
  }
}
