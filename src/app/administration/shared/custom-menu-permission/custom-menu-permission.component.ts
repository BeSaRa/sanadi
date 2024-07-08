import {LangService} from '@services/lang.service';
import {Component, Input, OnInit} from '@angular/core';
import {CustomMenuService} from '@services/custom-menu.service';
import {CustomMenu} from '@app/models/custom-menu';
import {map, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {InternalUser} from '@app/models/internal-user';
import {LookupService} from '@services/lookup.service';
import {CheckGroupHandler} from '@app/models/check-group-handler';
import {Lookup} from '@app/models/lookup';
import {CheckGroup} from '@app/models/check-group';
import {UserCustomMenuService} from '@services/user-custom-menu.service';
import {UserCustomMenu} from '@app/models/user-custom-menu';
import {SharedService} from '@services/shared.service';
import {ExternalUser} from '@app/models/external-user';
import {ExternalUserUpdateRequest} from '@app/models/external-user-update-request';
import {TabMap} from '@app/types/types';

@Component({
  selector: 'custom-menu-permission',
  templateUrl: './custom-menu-permission.component.html',
  styleUrls: ['./custom-menu-permission.component.scss']
})
export class CustomMenuPermissionComponent implements OnInit {
  destroy$: Subject<void> = new Subject();
  chunkSize: number = 3;

  private oldSelection$: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);

  @Input() user!: InternalUser | ExternalUser;
  @Input() readonly: boolean = false;
  @Input() userUpdateRequest?: ExternalUserUpdateRequest;

  constructor(public lang: LangService,
              private lookupService: LookupService,
              private customMenuService: CustomMenuService,
              private userCustomMenuService: UserCustomMenuService,
              private sharedService: SharedService,
              public langService: LangService) {
  }

  allCustomMenusList: CustomMenu[] = [];
  allDefaultCustomMenusList: CustomMenu[] = [];
  permissionGroups: CheckGroup<CustomMenu>[] = [];
  defaultPermissionGroups: CheckGroup<CustomMenu>[] = [];
  groupHandler!: CheckGroupHandler<CustomMenu>;
  defaultGroupHandler!: CheckGroupHandler<CustomMenu>;
  tabsData: TabMap = {

    menus: {
      name: 'menus',
      langKey: 'menus',
      index: 0,
      validStatus: () => true,
      isTouchedOrDirty: () => true
    },
    defaultMenus: {
      name: 'systemMenus',
      langKey: 'systemMenus',
      index: 1,
      validStatus: () => true,
      isTouchedOrDirty: () => true
    },


  };

  ngOnInit(): void {
    this._loadCustomMenuPermissions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private _loadPrivateCustomMenus(): Observable<CustomMenu[]> {
    return this.customMenuService.loadPrivateMenusByUserType(this.user.userType)
      .pipe(tap((result) => {
        this.allCustomMenusList = result
        const systemCustomMenu = result.find(x => x.isDefaultItem());
        if (systemCustomMenu) {
          this.allDefaultCustomMenusList = systemCustomMenu.subMenuItems
        }
      }));
  }

  private _loadCustomMenuPermissions(): void {
    this._loadPrivateCustomMenus()
      .pipe(map(result => this._sortMenusSetParentAsFirst(result)))
      .pipe(withLatestFrom(of(this.lookupService.listByCategory.MenuType)))
      .pipe(switchMap(([menus, groups]) => {
        this.buildPermissionGroups(groups, menus.result);
        this.buildDefaultPermissionGroups(groups, menus.defaultResult);
        this.groupHandler = new CheckGroupHandler<CustomMenu>(this.permissionGroups,
          undefined,
          (item: CustomMenu, isChecked: boolean, group: CheckGroup<CustomMenu>) => this.onPermissionChanged(item, isChecked, group)
        );
        this.defaultGroupHandler = new CheckGroupHandler<CustomMenu>(this.defaultPermissionGroups,
          undefined,
          (item: CustomMenu, isChecked: boolean, group: CheckGroup<CustomMenu>) => this.onDefaultPermissionChanged(item, isChecked, group)
        );
        return of(true);
      }))
      .pipe(switchMap(_ => {
        if (!!this.userUpdateRequest) {
          this.oldSelection$.next([...(this.userUpdateRequest.newMenuList ?? [])]);
          return of((this.userUpdateRequest.newMenuList ?? []));
        }
        if (!this.user.generalUserId) {
          this.oldSelection$.next([]);
          return of([]);
        }
        return this.userCustomMenuService.loadByCriteria({generalUserId: this.user.generalUserId})
          .pipe(
            map((userCustomMenus: UserCustomMenu[]) => userCustomMenus.map(p => p.menuItemId)),
            tap((selectedMenus: number[]) => this.oldSelection$.next([...selectedMenus]))
          );
      }))
      .subscribe((selectedMenus: number[]) => {
        const menus = [...new Set(selectedMenus)];
        this.groupHandler.setSelection(menus);
        this.defaultGroupHandler.setSelection(menus);


      });

  }

  private _fillParentChunkSpace(menus: CustomMenu[], parent: CustomMenu): CustomMenu[] {
    for (let i = 0; i < (this.chunkSize - 1); i++) {
      menus = menus.concat(new CustomMenu().clone({menuType: parent.menuType, parentMenuItemId: undefined}));
    }
    return menus;
  }

  private _fillChildrenChunkSpace(childMenus: CustomMenu[], lastChild: CustomMenu, hasSystemParent = false): CustomMenu[] {
    const missingChildrenCount = this.chunkSize - (childMenus.length % this.chunkSize);
    if (missingChildrenCount === this.chunkSize) {
      return childMenus;
    }
    for (let i = 0; i < missingChildrenCount; i++) {
      childMenus = childMenus.concat(new CustomMenu().clone({
        menuType: lastChild.menuType,
        parentMenuItemId: lastChild.parentMenuItemId,
        hasSystemParent: hasSystemParent
      }));
    }
    return childMenus;
  }

  private _sortMenusSetParentAsFirst(menus: CustomMenu[]): { result: CustomMenu[], defaultResult: CustomMenu[] } {
    let result: CustomMenu[] = [];
    let defaultResult: CustomMenu[] = [];
    let parents: CustomMenu[] = [], parentChildrenMap = new Map<number, CustomMenu[]>;
    let defaultParents: CustomMenu[] = [];
    let defaultChildrenMap = new Map<string, CustomMenu[]>;
    const systemMenu = menus.find(x => x.isSystem)!;
    menus.map((menu) => {
      if (!menu.parentMenuItemId && !menu.isDefaultItem()) {
        parents.push(menu);
      }
      if (menu.parentMenuItemId && !menu.hasDefaultParent(systemMenu)) {
        parentChildrenMap.set(menu.parentMenuItemId, (parentChildrenMap.get(menu.parentMenuItemId) ?? []).concat(menu));
      }
      if (menu.systemMenuKey && menu.hasDefaultParent(systemMenu)) {
        if (!defaultParents.find(m => m.systemMenuKey === menu.systemMenuKey && m.menuType === menu.menuType)) {
          defaultParents.push(new CustomMenu().clone({
            menuType: menu.menuType,
            systemMenuKey: menu.systemMenuKey,
            isSystemParent: true,
            parentMenuItemId: menu.parentMenuItemId
          }))
        }
        defaultChildrenMap.set(menu.systemMenuKey + '-' + menu.menuType, (defaultChildrenMap.get(menu.systemMenuKey + '-' + menu.menuType) ?? []).concat(menu));

      }
    });
    parents.forEach((parent) => {
      result.push(parent);
      // add empty custom menu to complete the chunk length of parents
      result = this._fillParentChunkSpace(result, parent);
      let children = parentChildrenMap.get(parent.id) ?? [];
      if (children.length > 0) {
        children = this._fillChildrenChunkSpace(children, children[0]);
      }
      result = result.concat(children);
    });
    defaultParents.forEach((parent) => {
      defaultResult.push(parent);
      // add empty custom menu to complete the chunk length of parents
      // defaultResult = this._fillParentChunkSpace(defaultResult, parent);
      let children = defaultChildrenMap.get(parent.systemMenuKey! + '-' + parent.menuType) ?? [];
      parent.subMenuItems = children;
      defaultResult = defaultResult.concat(children);
    });

    return {
      result: result,
      defaultResult: defaultResult
    };
  }

  private buildPermissionGroups(groups: Lookup[], menus: CustomMenu[]): void {
    const permissionsByGroup = new Map<number, CustomMenu[]>();
    this.permissionGroups = [];
    menus.reduce((record, menu) => {
      return permissionsByGroup.set(menu.menuType, (permissionsByGroup.get(menu.menuType) || []).concat(menu));
    }, {} as any);
    groups.forEach(group => {
      let itemsInGroup = permissionsByGroup.get(group.lookupKey) || [];

      if (itemsInGroup.length > 0) {
        this.permissionGroups.push(new CheckGroup<CustomMenu>(group, itemsInGroup, [], this.chunkSize, true));
      }
    });
  }

  private buildDefaultPermissionGroups(groups: Lookup[], menus: CustomMenu[]): void {
    const permissionsByGroup = new Map<number, CustomMenu[]>();
    this.defaultPermissionGroups = [];
    menus.reduce((record, menu) => {
      return permissionsByGroup.set(menu.menuType, (permissionsByGroup.get(menu.menuType) || []).concat(menu));
    }, {} as any);

    groups.forEach(group => {
      let items: CustomMenu[] = [];
      let itemsInGroup = permissionsByGroup.get(group.lookupKey) || [];

      itemsInGroup.forEach(item => {
        if (item.isSystemParent) {
          items.push(item);
          items = this._fillParentChunkSpace(items, item);
          let children = itemsInGroup.filter(x => x.systemMenuKey === item.systemMenuKey && !x.isSystemParent && x.menuType === item.menuType);
          if (children.length > 0) {
            children = this._fillChildrenChunkSpace(children, children[0], true);
          }
          items = items.concat(children);
        }

      })
      if (itemsInGroup.length > 0) {
        this.defaultPermissionGroups.push(new CheckGroup<CustomMenu>(group, items, [], this.chunkSize, true));
      }
    });
  }

  private _isAlreadySelected(id?: number): boolean {
    if (!id) {
      return false;
    }
    return this.groupHandler.getSelection().includes(id);
  }

  private _forceSelectPermission(item: CustomMenu, group: CheckGroup<CustomMenu>) {
    this.groupHandler.forceSelectCheckbox(item, group);
  }

  private _forceRemovePermission(item: CustomMenu, group: CheckGroup<CustomMenu>) {
    this.groupHandler.forceRemoveCheckbox(item, group);
  }

  private onPermissionChanged(item: CustomMenu, isChecked: boolean, group: CheckGroup<CustomMenu>): void {
    if (item.isParentMenu()) {
      // if parent is toggled, toggle all children items accordingly
      let children = this.allCustomMenusList.filter((menu) => menu.parentMenuItemId === item.id);
      children.forEach((childMenu) => {
        if (isChecked) {
          !this._isAlreadySelected(childMenu.id) && this._forceSelectPermission(childMenu, group);
        } else {
          this._isAlreadySelected(childMenu.id) && this._forceRemovePermission(childMenu, group);
        }
      });
    } else {
      // if child is selected and parent is not selected, force select the parent
      if (isChecked && !this._isAlreadySelected(item.parentMenuItemId)) {
        let parent = this.allCustomMenusList.find((menu) => menu.id === item.parentMenuItemId);
        parent && this._forceSelectPermission(parent, group);
      }
    }
  }

  private onDefaultPermissionChanged(item: CustomMenu, isChecked: boolean, group: CheckGroup<CustomMenu>): void {
    if (item.isSystemParentItem()) {
      // if parent is toggled, toggle all children items accordingly
      let children = this.allDefaultCustomMenusList
        .filter((menu) => menu.systemMenuKey === item.systemMenuKey && menu.menuType === item.menuType && !menu.isSystemParent);

      children.forEach((childMenu) => {
        if (isChecked) {
          !this._isAlreadySelected(childMenu.id) && this._forceSelectPermission(childMenu, group);
        } else {
          this._isAlreadySelected(childMenu.id) && this._forceRemovePermission(childMenu, group);
        }
      });
    } else {
      // if child is selected and parent is not selected, force select the parent
      if (isChecked && !this._isAlreadySelected(item.parentMenuItemId)) {
        let parent = this.allCustomMenusList.find((menu) => menu.id === item.parentMenuItemId);
        parent && this._forceSelectPermission(parent, group);
      }
    }
  }

  isParentRow(row: CustomMenu[]): boolean {
    return !row[0].parentMenuItemId;
  }

  isDefaultParentRow(row: CustomMenu[]): boolean {
    return (!!row[0].systemMenuKey && row[0].isSystemParent);
  }

  getOldUserMenuPermissions(): number[] {
    return [...new Set(this.oldSelection$.value)] ?? [];
  }

  getFinalUserMenuPermissions(): number[] {
    let selection: number[] = [];
    selection = selection.concat(this.groupHandler.getSelection().filter((item, index, list) => list.indexOf(item) === index));
    selection = selection.concat(this.defaultGroupHandler.getSelection().filter((item, index, list) => list.indexOf(item) === index));
    return [...new Set(selection)] ?? [];
  }

  saveUserCustomMenuPermissions(): Observable<UserCustomMenu[]> {
    const selection: number[] = this.getFinalUserMenuPermissions();
    return this.userCustomMenuService.saveUserCustomMenu(this.user.generalUserId, selection);
  }

  printPermissions($event: MouseEvent): void {
    $event?.preventDefault();
    this.userCustomMenuService.loadPermissionsAsBlob(this.user.generalUserId)
      .subscribe((data) => {
        this.sharedService.downloadFileToSystem(data, 'UserCustomMenuPermission_' + this.user.getName());
      });
  }

  isMainMenu(menu: CustomMenu) {
    return menu.id === 1;
  }

  getRandomValue(index: number) {
    return new Date(index).getMilliseconds();
  }

  onDefaultPermissionClicked(item: CustomMenu, {target}: Event, group: CheckGroup<CustomMenu>, groupHandler: CheckGroupHandler<CustomMenu>): void {
    let check = CheckGroupHandler.getCheckState(target);
    if (item.isSystemParentItem()) {
      if (check) {
        this.checkAllChildren(item, group, groupHandler);
        return;
      }
      this.unCheckAllChildren(item, group, groupHandler);
      return;
    }
    check ? groupHandler.addToSelection(item, group) : groupHandler.removeFromSelection(item, group);
    return;
  }

  unCheckAllChildren(menu: CustomMenu, group: CheckGroup<CustomMenu>, groupHandler: CheckGroupHandler<CustomMenu>) {
    menu.getChildrenIds().forEach(id => {
      if (!groupHandler.selection.includes(id)) return;
      const child = {id: id} as CustomMenu;
      groupHandler.removeFromSelection(child, group);
    });
  }

  checkAllChildren(menu: CustomMenu, group: CheckGroup<CustomMenu>, groupHandler: CheckGroupHandler<CustomMenu>) {
    menu.getChildrenIds().forEach(id => {
      if (groupHandler.selection.includes(id))
        return;
      const child = {id: id} as CustomMenu;
      groupHandler.addToSelection(child, group);
    });
  }
}
