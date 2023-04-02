import { LangService } from '@services/lang.service';
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
import { TabMap } from '@app/types/types';

@Component({
  selector: 'custom-menu-permission',
  templateUrl: './custom-menu-permission.component.html',
  styleUrls: ['./custom-menu-permission.component.scss']
})
export class CustomMenuPermissionComponent implements OnInit {
  destroy$: Subject<any> = new Subject<any>();
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
              public langService:LangService) {
  }

  allCustomMenusList: CustomMenu[] = [];
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
      name: 'menus',
      langKey: 'menus',
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
      .pipe(tap((result) => this.allCustomMenusList = result));
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
          (item: CustomMenu, isChecked: boolean, group: CheckGroup<CustomMenu>) => this.onPermissionChanged(item, isChecked, group)
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
        this.groupHandler.setSelection(selectedMenus);
        this.defaultGroupHandler.setSelection(selectedMenus);


      });

  }

  private _fillParentChunkSpace(menus: CustomMenu[], parent: CustomMenu): CustomMenu[] {
    for (let i = 0; i < (this.chunkSize - 1); i++) {
      menus = menus.concat(new CustomMenu().clone({menuType: parent.menuType, parentMenuItemId: undefined}));
    }
    return menus;
  }

  private _fillChildrenChunkSpace(childMenus: CustomMenu[], lastChild: CustomMenu): CustomMenu[] {
    const missingChildrenCount = this.chunkSize - (childMenus.length % this.chunkSize);
    if (missingChildrenCount === this.chunkSize) {
      return childMenus;
    }
    for (let i = 0; i < missingChildrenCount; i++) {
      childMenus = childMenus.concat(new CustomMenu().clone({menuType: lastChild.menuType, parentMenuItemId: lastChild.parentMenuItemId}));
    }
    return childMenus;
  }

  private _sortMenusSetParentAsFirst(menus: CustomMenu[]):{result:CustomMenu[],defaultResult:CustomMenu[]} {
    let result: CustomMenu[] = [];
    let defaultResult:CustomMenu[] = [];
    let parents: CustomMenu[] = [], parentChildrenMap = new Map<number, CustomMenu[]>;
    let defaultParents: CustomMenu[] = [] ;
    let defaultChildrenMap = new Map<string, CustomMenu[]>;
    menus.map((menu) => {
      if (!menu.parentMenuItemId && !menu.isDefaultItem()) {
        parents.push(menu);
      }
      if(menu.parentMenuItemId && !menu.hasDefaultParent()) {
        parentChildrenMap.set(menu.parentMenuItemId, (parentChildrenMap.get(menu.parentMenuItemId) ?? []).concat(menu));
      }
      if(menu.systemMenuKey && menu.hasDefaultParent()){
        if(!defaultParents.find(m => m.systemMenuKey === menu.systemMenuKey && m.menuType === menu.menuType)){
          defaultParents.push(new CustomMenu().clone({
            menuType : menu.menuType,
            systemMenuKey: menu.systemMenuKey,
            isSystemParent:true,
          }))
        }
        defaultChildrenMap.set(menu.systemMenuKey+'-'+menu.menuType, (defaultChildrenMap.get(menu.systemMenuKey+'-'+menu.menuType) ?? []).concat(menu));

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
      let children = defaultChildrenMap.get(parent.systemMenuKey!+'-'+ parent.menuType) ?? [];

      if (children.length > 0) {
        // children = this._fillChildrenChunkSpace(children, children[0]);
      }
      defaultResult = defaultResult.concat(children);
    });

    return {
      result:result,
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
    menus.forEach(( menu) => {
       permissionsByGroup.set(menu.menuType, (permissionsByGroup.get(menu.menuType) || []).concat(menu));
    });

    groups.forEach(group => {
      let items:CustomMenu[] =[];
      let itemsInGroup = permissionsByGroup.get(group.lookupKey) || [];
      itemsInGroup.forEach(item=>{
        if(item.isSystemParent){
          items.push(item);
          items = this._fillParentChunkSpace(items,item);
          let children = itemsInGroup.filter(x => x.systemMenuKey === item.systemMenuKey && !x.isSystemParent && x.menuType === item.menuType) ;
          console.log(children);

          if (children.length > 0) {
            children = this._fillChildrenChunkSpace(children, children[0]);
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

  isParentRow(row: CustomMenu[]): boolean {
    return !row[0].parentMenuItemId;
  }
  isDefaultParentRow(row: CustomMenu[]): boolean {
    return (!!row[0].systemMenuKey && row[0].isSystemParent)
        ;
  }

  getOldUserMenuPermissions(): number[] {
    return this.oldSelection$.value;
  }

  getFinalUserMenuPermissions(): number[] {
    return this.groupHandler.getSelection().filter((item, index, list) => list.indexOf(item) === index);
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
  isMainMenu(menu:CustomMenu){
    return menu.id === 1;
  }
}
