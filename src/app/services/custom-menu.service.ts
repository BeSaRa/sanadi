import {
  CustomMenuDefaultsPopupComponent
} from './../administration/popups/custom-menu-defaults-popup/custom-menu-defaults-popup.component';
import {ComponentType} from '@angular/cdk/portal';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {CastResponse, CastResponseContainer} from '@app/decorators/decorators/cast-response';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {CrudWithDialogGenericService} from '@app/generics/crud-with-dialog-generic-service';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {Pagination} from '@app/models/pagination';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {Observable, of} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {CustomMenuPopupComponent} from '../administration/popups/custom-menu-popup/custom-menu-popup.component';
import {CustomMenu} from '@models/custom-menu';
import {DialogService} from './dialog.service';
import {FactoryService} from './factory.service';
import {UrlService} from './url.service';
import {PaginationContract} from '@contracts/pagination-contract';
import {CommonUtils} from '@helpers/common-utils';
import {MenuItemParametersEnum} from '@app/enums/menu-item-parameters.enum';
import {EmployeeService} from '@services/employee.service';
import {LangService} from '@services/lang.service';
import {TokenService} from '@services/token.service';
import {ICustomMenuSearchCriteria} from '@contracts/i-custom-menu-search-criteria';
import {MenuView} from '@app/enums/menu-view.enum';
import {MenuItemService} from '@services/menu-item.service';
import {MenuItem} from '@app/models/menu-item';
import {MenuItemInterceptor} from '@app/model-interceptors/menu-item-interceptor';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {UserTypes} from '@app/enums/user-types.enum';

@CastResponseContainer({
  $default: {
    model: () => CustomMenu,
  },
  $pagination: {
    model: () => Pagination,
    shape: {'rs.*': () => CustomMenu},
  },
})
@Injectable({
  providedIn: 'root',
})
export class CustomMenuService extends CrudWithDialogGenericService<CustomMenu> {
  list: CustomMenu[] = [];
  dynamicMainMenuUrl: string = 'home/dynamic-menus/:parentId';
  dynamicMainMenuDetailsUrl: string = 'home/dynamic-menus/:parentId/details';
  dynamicChildMenuUrl: string = 'home/dynamic-menus/:parentId/details/:id';

  constructor(public dialog: DialogService,
              public http: HttpClient,
              private urlService: UrlService,
              private langService: LangService,
              private tokenService: TokenService,
              private menuItemService: MenuItemService,
              private employeeService: EmployeeService) {
    super();
    FactoryService.registerService('CustomMenuService', this);
  }

  _getDialogComponent(): ComponentType<any> {
    return CustomMenuPopupComponent;
  }

  _getModel(): new () => CustomMenu {
    return CustomMenu;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.MENU_ITEM_LIST;
  }

  @CastResponse(undefined, {
    fallback: '$pagination'
  })
  private _loadMain(options: Partial<PaginationContract>): Observable<Pagination<CustomMenu[]>> {
    return this.http.get<Pagination<CustomMenu[]>>(this._getServiceURL() + '/main', {
      params: {...options}
    });
  }

  loadMain(options: Partial<PaginationContract>): Observable<Pagination<CustomMenu[]>> {
    return this._loadMain(options);
  }

  @CastResponse(() => CustomMenu, {
    fallback: '$default',
    unwrap: 'rs'
  })
  loadMenuTree(): Observable<CustomMenu[]> {
    return this.http.get<CustomMenu[]>(this._getServiceURL() + '/tree');
  }

  loadByParentId(parentId: number): Observable<CustomMenu[]> {
    let criteria: Partial<ICustomMenuSearchCriteria> = {
      'parent-menu-item-id': parentId
    };
    return this.loadByCriteria(criteria);
  }

  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  loadByCriteria(criteria: Partial<ICustomMenuSearchCriteria>): Observable<CustomMenu[]> {
    delete criteria.offset;
    delete criteria.limit;

    return this.http.get<CustomMenu[]>(this._getServiceURL() + '/criteria', {
      params: new HttpParams({fromObject: criteria})
    })
      .pipe(catchError(() => of([])));
  }

  @CastResponse(undefined, {
    fallback: '$pagination'
  })
  loadByCriteriaPaging(criteria: Partial<ICustomMenuSearchCriteria>, options: Partial<PaginationContract>): Observable<Pagination<CustomMenu[]>> {
    criteria.offset = options.offset;
    criteria.limit = options.limit;

    return this.http.get<Pagination<CustomMenu[]>>(this._getServiceURL() + '/criteria', {
      params: new HttpParams({fromObject: criteria})
    })
      .pipe(catchError(() => of(this._emptyPaginationListResponse)));
  }

  loadPrivateMenus(): Observable<CustomMenu[]> {
    return this.loadByCriteria({'menu-view': MenuView.PRIVATE});
  }

  loadPrivateMenusByUserType(userType: UserTypes): Observable<CustomMenu[]> {
    return this.loadPrivateMenus()
      .pipe(
        catchError(() => of([])),
        map((result) => result.filter(menu => {
          if(menu.isDefaultItem()) return true;
          return userType === UserTypes.INTERNAL ? !menu.isExternalUserMenu() : !menu.isInternalUserMenu();
        }))
      );
  }

  openCreateDialog(parentMenu?: CustomMenu): DialogRef {
    let data = new CustomMenu().clone({status: CommonStatusEnum.ACTIVATED});
    if (parentMenu) {
      data.parentMenuItemId = parentMenu.id;
      data.menuView = parentMenu.menuView;
      data.menuType = parentMenu.menuType;
      data.userType = parentMenu.userType;
      data.status = parentMenu.status;
      data.hasSystemParent = parentMenu.isSystem
    }
    return this.dialog.show<IDialogData<CustomMenu>>(this._getDialogComponent(), {
      model: data,
      operation: OperationTypes.CREATE,
      parentMenu: parentMenu
    });
  }

  openDefaultCreateDialog(parentMenu: MenuItem): DialogRef {
    let data = new CustomMenu().clone({status: CommonStatusEnum.ACTIVATED});
    data.defaultParent = parentMenu
    data.parentMenuItemId = -1;
    data.systemMenuKey = parentMenu.menuKey;
    return this.dialog.show<IDialogData<CustomMenu>>(this._getDialogComponent(), {
      model: data,
      operation: OperationTypes.CREATE,
      parentMenu: parentMenu
    });
  }

  openEditDialog(modelId: number, parentMenu?: CustomMenu, selectedPopupTab: string = 'basic'): Observable<DialogRef> {
    return this.getById(modelId).pipe(
      switchMap((item: CustomMenu) => {
        return of(this.dialog.show<IDialogData<CustomMenu>>(this._getDialogComponent(), {
          model: item,
          operation: OperationTypes.UPDATE,
          selectedTab: selectedPopupTab || 'basic',
          parentMenu: parentMenu
        }));
      })
    );
  }

  openViewDialog(modelId: number, parentMenu?: CustomMenu, selectedPopupTab: string = 'basic'): Observable<DialogRef> {
    return this.getById(modelId).pipe(
      switchMap((item: CustomMenu) => {
        return of(this.dialog.show<IDialogData<CustomMenu>>(this._getDialogComponent(), {
          model: item,
          operation: OperationTypes.VIEW,
          selectedTab: selectedPopupTab || 'basic',
          parentMenu: parentMenu
        }));
      })
    );
  }

  openDefaultChildrenViewDialog(item: MenuItem): Observable<DialogRef> {
    return of(this.dialog.show(CustomMenuDefaultsPopupComponent, {
      parent: item,
      operation: OperationTypes.VIEW,
      selectedTab: 'sub',
    }));
  }

  updateStatus(recordId: number, newStatus: CommonStatusEnum) {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activate(recordId) : this._deactivate(recordId);
  }

  updateStatusBulk(recordIds: number[], newStatus: CommonStatusEnum): Observable<any> {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activateBulk(recordIds) : this._deactivateBulk(recordIds);
  }

  private _activate(recordId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + recordId + '/activate', {});
  }

  private _deactivate(recordId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + recordId + '/de-activate', {});
  }

  private _activateBulk(recordIds: number[]) {
    return this.http.put(this._getServiceURL() + '/bulk/activate', recordIds)
      .pipe(
        map((response: any) => {
          return response.rs;
        })
      );
  }

  private _deactivateBulk(recordIds: number[]) {
    return this.http.put(this._getServiceURL() + '/bulk/de-activate', recordIds)
      .pipe(
        map((response: any) => {
          return response.rs;
        })
      );
  }

  findVariablesInUrl(url: string): string[] {
    if (!CommonUtils.isValidValue(url)) {
      return [];
    }
    return (url.match(/{(\w+)}/g) ?? []);
  }

  getUrlReplacementValue(variableValue: MenuItemParametersEnum): string {
    let value: string | number | undefined = '';
    switch (variableValue) {
      case MenuItemParametersEnum.GENERAL_USER_ID:
        value = this.employeeService.getCurrentUser().generalUserId;
        break;
      case MenuItemParametersEnum.LANG_CODE:
        value = this.langService.map.lang;
        break;
      case MenuItemParametersEnum.USER_TOKEN:
        value = this.tokenService.getToken();
        break;
      case MenuItemParametersEnum.PROFILE_ID:
        value = this.employeeService.isExternalUser() ? this.employeeService.getProfile()?.id : -1;
        break;
      case MenuItemParametersEnum.DOMAIN_NAME:
        value = this.employeeService.getCurrentUser().domainName;
        break;
    }
    return (value ?? '') + '';
  }

  private _getMaxParentItemOrder(finalList: MenuItem[]) {
    if (finalList.length === 0) {
      return this.menuItemService.getMaxParentMenuSortOrder();
    } else {
      return Math.max(...(finalList.filter(x => !x.parent).map(item => item.itemOrder)));
    }
  }

  private _getMaxChildItemOrder(finalList: MenuItem[], customMenuParentId: number) {
    let childMenuList = finalList.filter(item => item.customMenu && item.customMenu.id === customMenuParentId);
    if (!childMenuList || childMenuList.length === 0) {
      return 0;
    }
    return Math.max(...(childMenuList.map(item => item.itemOrder)));
  }

  private _getMaxSystemChildItemOrder(systemParentMenuId: number) {
    const childSystemItemList = this.menuItemService.menuItems.filter(x => x.parent === systemParentMenuId);
    if (!childSystemItemList || childSystemItemList.length === 0) {
      return 0;
    }
    return Math.max(...(childSystemItemList.map(item => item.itemOrder)));
  }

  private _transformParentMenu(customMenu: CustomMenu, newId: number, newItemOrder: number, hasChildren: boolean): MenuItem {
    return (new MenuItemInterceptor).receive(new MenuItem().clone({
      id: newId,
      itemOrder: newItemOrder,
      parent: undefined,
      // langKey: '',
      arName: customMenu.arName,
      enName: customMenu.enName,
      group: 'main',
      isSvg: false,
      icon: customMenu.icon ?? ActionIconsEnum.MENU,
      path: (hasChildren ? this.dynamicMainMenuUrl : this.dynamicMainMenuDetailsUrl).change({parentId: customMenu.id}),
      customMenu: customMenu,
    }));
  }

  private _transformChildMenu(customMenu: CustomMenu, newId: number, newItemOrder: number, newParentId: number, group: string): MenuItem {
    return (new MenuItemInterceptor).receive(new MenuItem().clone({
      id: newId,
      itemOrder: newItemOrder,
      parent: newParentId,
      // langKey: '',
      arName: customMenu.arName,
      enName: customMenu.enName,
      group: group,// 'dynamic-menus-' + customMenu.parentMenuItemId,
      isSvg: false,
      icon: customMenu.icon ?? ActionIconsEnum.MENU,
      path: this.dynamicChildMenuUrl.change({parentId: customMenu.parentMenuItemId, id: customMenu.id}),
      customMenu: customMenu
    }));
  }

  private _transformToMenuItems(customMenuList: CustomMenu[]): MenuItem[] {
    let maxId = this.menuItemService.getMaxMenuItemId();
    let finalList: MenuItem[] = [];
    let parentList: CustomMenu[] = [];
    let childrenList: CustomMenu[] = [];
    let systemChildrenList: CustomMenu[] = [];
    // const systemMenu = customMenuList.find(x=>x.isSystem)!;

    customMenuList.forEach((item: CustomMenu) => {
      if(item.userType !== UserTypes.ALL && item.userType !== this.employeeService.getCurrentUser().userType){
        return;
      }
      if (!item.parentMenuItemId && !item.isDefaultItem()) {
        parentList.push(item);
        return;
      }
      if (!!item.parentMenuItemId && !!item.menuURL) {
        if (!item.systemMenuKey) {
          childrenList.push(item);
          return;
        }
        if (!!item.systemMenuKey) {
          systemChildrenList.push(item);
          return;
        }
      }
    });
    childrenList = childrenList.sort((a: CustomMenu, b: CustomMenu) => a.menuOrder - b.menuOrder)
    systemChildrenList = systemChildrenList.sort((a: CustomMenu, b: CustomMenu) => a.menuOrder - b.menuOrder)

    // let parentList = customMenuList.filter(item => !item.parentMenuItemId && !item.isDefaultItem());
    // let childrenList = customMenuList.filter(item => !!item.parentMenuItemId && !!item.menuURL && !item.hasDefaultParent())
    //   .sort((a: CustomMenu, b: CustomMenu) => a.menuOrder - b.menuOrder); // children must have menuUrl
    // let systemChildrenList =  customMenuList.filter(item => !!item.parentMenuItemId && !!item.menuURL && item.hasDefaultParent())
    // .sort((a: CustomMenu, b: CustomMenu) => a.menuOrder - b.menuOrder);

    parentList.forEach((parentMenu: CustomMenu) => {
      const hasChildren: boolean = !!childrenList.find(x => x.parentMenuItemId === parentMenu.id);
      // parent must have children or menu url. (if it has children, no need to have menuUrl as it will be ignored)
      // if parent does not have children, it must have menu url to open page
      if (hasChildren || parentMenu.menuURL) {
        ++maxId;
        let itemOrder = this._getMaxParentItemOrder(finalList) + 1;
        finalList.push(this._transformParentMenu(parentMenu, maxId, itemOrder, hasChildren));
      }
    });

    childrenList.forEach((childMenu: CustomMenu) => {
      ++maxId;
      let newParent = finalList.find(x => x.customMenu && x.customMenu.id === childMenu.parentMenuItemId);
      // if no newParent is found, add the current menu as parent menu instead of child menu
      if (!newParent) {
        let itemOrder = this._getMaxParentItemOrder(finalList) + 1;
        finalList.push(this._transformParentMenu(childMenu, maxId, itemOrder, false));
      } else {
        let itemOrder = this._getMaxChildItemOrder(finalList, childMenu.parentMenuItemId!) + 1;
        let groupName = 'dynamic-menus-' + childMenu.parentMenuItemId;
        finalList.push(this._transformChildMenu(childMenu, maxId, itemOrder, newParent!.id, groupName));
      }
    });
    systemChildrenList.forEach((childMenu: CustomMenu) => {
      let systemParent = childMenu.getSystemParent();
      if (!systemParent) {
        return;
      }
      let itemOrder = this._getMaxChildItemOrder(finalList, systemParent.id!) + this._getMaxSystemChildItemOrder(systemParent.id);
      let groupName = (systemParent.data && systemParent.data.childrenGroupName) || systemParent.group;
      finalList.push(this._transformChildMenu(childMenu, maxId, itemOrder, systemParent.id!, groupName));

    })
    return finalList;
  }

  prepareCustomMenuList(): Observable<MenuItem[]> {
    const list = this._transformToMenuItems(this.employeeService.menuItems);

    this.menuItemService.menuItems = this.menuItemService.menuItems.concat(list);
    return of(this.menuItemService.menuItems);
  }
}
