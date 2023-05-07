import {ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot} from "@angular/router";
import {switchMap, tap} from "rxjs/operators";
import {StaticAppResourcesService} from "@services/static-app-resources.service";
import {EncryptionService} from "@services/encryption.service";
import {LangService} from "@services/lang.service";
import {inject} from "@angular/core";
import {DialogService} from "@services/dialog.service";
import {ConfigurationService} from "@services/configuration.service";
import {INavigatedItem} from "@contracts/inavigated-item";
import {ICustomRouteData} from "@contracts/i-custom-route-data";
import {of} from "rxjs";
import {CommonUtils} from "@helpers/common-utils";
import {PermissionGroupsEnum} from "@enums/permission-groups-enum";
import {EmployeeService} from "@services/employee.service";

export class ServicesGuard {

  private static data: {
    itemKey: string,
    route: ActivatedRouteSnapshot,
    langService: LangService,
    dialogService: DialogService,
    employeeService: EmployeeService,
    encryptionService: EncryptionService,
    configurationService: ConfigurationService,
    staticResourcesService: StaticAppResourcesService
  } = {} as any;

  static canActivate: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    this._init(route);
    const hasPermission = this._hasPermission(route.data as ICustomRouteData);
    return of(hasPermission)
      .pipe(switchMap(value => value ? of(value) : of((this.hasItemParam() && this.validItem()))))
      .pipe(tap(hasPermission => !hasPermission ? this._displayAccessDeniedMessage() : null));
  }

  private static _init(route: ActivatedRouteSnapshot): void {
    this.data.dialogService = inject(DialogService);
    this.data.langService = inject(LangService);
    this.data.employeeService = inject(EmployeeService);
    this.data.encryptionService = inject(EncryptionService);
    this.data.configurationService = inject(ConfigurationService);
    this.data.staticResourcesService = inject(StaticAppResourcesService);

    this.data.itemKey = this.data.configurationService.CONFIG.E_SERVICE_ITEM_KEY;
    this.data.route = route;
  }

  // to check if there is item param
  private static hasItemParam(): boolean {
    return this.data.route.queryParamMap.has(this.data.itemKey);
  }

  private static getItem(): string | null {
    return this.data.route.queryParamMap.get(this.data.itemKey);
  }

  private static validItem(): boolean {
    try {
      this.data.encryptionService.decrypt<INavigatedItem>(this.getItem()!);
      return true;
    } catch (e) {
      return false;
    }
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
