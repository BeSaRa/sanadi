import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, ParamMap, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {EmployeeService} from '@services/employee.service';
import {DialogService} from '@services/dialog.service';
import {LangService} from '@services/lang.service';
import {MenuItemService} from '@services/menu-item.service';
import {CommonUtils} from '@helpers/common-utils';
import {DynamicMenuRouteTypeEnum} from '@app/enums/dynamic-menu-route-type.enum';

@Injectable({
  providedIn: 'root'
})
export class DynamicMenuGuard implements CanActivate {
  constructor(private empService: EmployeeService,
              private dialogService: DialogService,
              private langService: LangService,
              private menuItemService: MenuItemService,
              private router: Router) {

  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | boolean {
    let dynamicMenuRouteType: DynamicMenuRouteTypeEnum = route.data.dynamicMenuRouteType;
    let hasAccess: boolean = this._checkHasAccess(dynamicMenuRouteType, route.paramMap);

    if (!hasAccess) {
      this._showAccessDenied();
    }
    return hasAccess;
  }

  private _checkHasAccess(checkFor: DynamicMenuRouteTypeEnum, paramMap: ParamMap): boolean {
    let hasAccess: boolean = false;
    switch (checkFor) {
      case DynamicMenuRouteTypeEnum.MODULE:
        hasAccess = this.menuItemService.menuItems.filter(x => !!x.customMenu).length > 0;
        break;
      case DynamicMenuRouteTypeEnum.PARENT:
        const parentMenuId = paramMap.get('parentId') ? Number(paramMap.get('parentId')) : null;
        if (!!parentMenuId) {
          const menuToAccess = this.menuItemService.menuItems.find(x => !!x.customMenu && x.customMenu.id === parentMenuId);
          hasAccess = (!!menuToAccess && menuToAccess.children.length > 0);
        }
        break;
      case DynamicMenuRouteTypeEnum.PARENT_DETAILS:
        const parentId = paramMap.get('parentId') ? Number(paramMap.get('parentId')) : null;
        if (!!parentId) {
          const menuToAccess = this.menuItemService.menuItems.find(x => !!x.customMenu && x.customMenu.id === parentId);
          hasAccess = (!!menuToAccess && (menuToAccess.children.length === 0 && CommonUtils.isValidValue(menuToAccess.customMenu?.menuURL)));
        }
        break;
      case DynamicMenuRouteTypeEnum.CHILD:
        const childId = paramMap.get('childId') ? Number(paramMap.get('childId')) : null;
        if (!!childId) {
          const menuToAccess = this.menuItemService.menuItems.find(x => x.customMenu && x.customMenu.id === childId);
          hasAccess = (!!menuToAccess && CommonUtils.isValidValue(menuToAccess.customMenu?.menuURL));
        }
        break;
      default:
        hasAccess = true;
    }
    return hasAccess;
  }

  private _showAccessDenied(): void {
    this.dialogService.info(this.langService.map.access_denied).onAfterClose$
      .subscribe(() => {
        this.router.navigate(['/']).then();
      });
  }

}
