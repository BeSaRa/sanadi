import {ActivatedRouteSnapshot, CanActivateFn, ParamMap, Router, RouterStateSnapshot} from "@angular/router";
import {DialogService} from "@services/dialog.service";
import {LangService} from "@services/lang.service";
import {tap} from "rxjs/operators";
import {inject} from "@angular/core";
import {of} from "rxjs";
import {MenuItemService} from "@services/menu-item.service";
import {EmployeeService} from "@services/employee.service";
import {DynamicMenuRouteTypeEnum} from "@enums/dynamic-menu-route-type.enum";
import {CommonUtils} from "@helpers/common-utils";

export class DynamicMenuGuard {

  private static data: {
    router: Router,
    dialogService: DialogService,
    langService: LangService,
    employeeService: EmployeeService,
    menuItemService: MenuItemService,
  } = {} as any;

  static canActivate: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    this._init();

    let dynamicMenuRouteType: DynamicMenuRouteTypeEnum = route.data.dynamicMenuRouteType;
    let hasAccess: boolean = this._checkHasAccess(dynamicMenuRouteType, route.paramMap);

    return of(hasAccess)
      .pipe(tap(hasPermission => !hasPermission ? this._displayAccessDeniedMessage() : null));
  }

  private static _init(): void {
    this.data.router = inject(Router);
    this.data.dialogService = inject(DialogService);
    this.data.langService = inject(LangService);
    this.data.employeeService = inject(EmployeeService);
    this.data.menuItemService = inject(MenuItemService);
  }

  private static _checkHasAccess(checkFor: DynamicMenuRouteTypeEnum, paramMap: ParamMap): boolean {
    let hasAccess: boolean = false;
    switch (checkFor) {
      case DynamicMenuRouteTypeEnum.MODULE:
        hasAccess = this.data.menuItemService.menuItems.filter(x => !!x.customMenu).length > 0;
        break;
      case DynamicMenuRouteTypeEnum.PARENT:
        const parentMenuId = paramMap.get('parentId') ? Number(paramMap.get('parentId')) : null;
        if (!!parentMenuId) {
          const menuToAccess = this.data.menuItemService.menuItems.find(x => !!x.customMenu && x.customMenu.id === parentMenuId);
          hasAccess = (!!menuToAccess && menuToAccess.children.length > 0);
        }
        break;
      case DynamicMenuRouteTypeEnum.PARENT_DETAILS:
        const parentId = paramMap.get('parentId') ? Number(paramMap.get('parentId')) : null;
        if (!!parentId) {
          const menuToAccess = this.data.menuItemService.menuItems.find(x => !!x.customMenu && x.customMenu.id === parentId);
          hasAccess = (!!menuToAccess && (menuToAccess.children.length === 0 && CommonUtils.isValidValue(menuToAccess.customMenu?.menuURL)));
        }
        break;
      case DynamicMenuRouteTypeEnum.CHILD:
        const childId = paramMap.get('childId') ? Number(paramMap.get('childId')) : null;
        if (!!childId) {
          const menuToAccess = this.data.menuItemService.menuItems.find(x => x.customMenu && x.customMenu.id === childId);
          hasAccess = (!!menuToAccess && CommonUtils.isValidValue(menuToAccess.customMenu?.menuURL));
        }
        break;
      default:
        hasAccess = true;
    }
    return hasAccess;
  }

  private static _displayAccessDeniedMessage() {
    this.data.dialogService.info(this.data.langService.map.access_denied).onAfterClose$
      .subscribe(() => {
        this.data.router.navigate(['/']).then();
      });
  }
}
