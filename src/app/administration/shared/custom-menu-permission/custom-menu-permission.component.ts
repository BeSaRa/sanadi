import {Component, Input, OnInit} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {CustomMenuService} from '@services/custom-menu.service';
import {CustomMenu} from '@app/models/custom-menu';
import {catchError, map, switchMap, takeUntil, tap, withLatestFrom} from 'rxjs/operators';
import {Observable, of, Subject} from 'rxjs';
import {InternalUser} from '@app/models/internal-user';
import {LookupService} from '@services/lookup.service';
import {CheckGroupHandler} from '@app/models/check-group-handler';
import {Lookup} from '@app/models/lookup';
import {CheckGroup} from '@app/models/check-group';
import {UserCustomMenuService} from '@services/user-custom-menu.service';
import {UserCustomMenu} from '@app/models/user-custom-menu';
import {SharedService} from '@services/shared.service';
import {ExternalUser} from '@app/models/external-user';

@Component({
  selector: 'custom-menu-permission',
  templateUrl: './custom-menu-permission.component.html',
  styleUrls: ['./custom-menu-permission.component.scss']
})
export class CustomMenuPermissionComponent implements OnInit {
  destroy$: Subject<any> = new Subject<any>();
  chunkSize: number = 3;

  @Input() user!: InternalUser | ExternalUser;
  @Input() readonly: boolean = false;

  constructor(public lang: LangService,
              private lookupService: LookupService,
              private customMenuService: CustomMenuService,
              private userCustomMenuService: UserCustomMenuService,
              private sharedService: SharedService) {
  }

  allCustomMenusList: CustomMenu[] = [];
  permissionGroups: CheckGroup<CustomMenu>[] = [];
  groupHandler!: CheckGroupHandler<CustomMenu>;

  ngOnInit(): void {
    this._loadPrivateCustomMenus();
    this._loadCustomMenuPermissions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private _loadPrivateCustomMenus(): Observable<CustomMenu[]> {
    return this.customMenuService.loadPrivateMenus()
      .pipe(
        takeUntil(this.destroy$),
        map((result: CustomMenu[]) => {
          return result.filter((menu) => {
            return this.user.isInternal() ? !menu.isExternalUserMenu() : !menu.isInternalUserMenu();
          });
        }),
        tap((result) => this.allCustomMenusList = result)
      )
      .pipe(catchError(()=> of([])));
  }

  private _loadCustomMenuPermissions(): void {
    this._loadPrivateCustomMenus()
      .pipe(map(result => this._sortMenusSetParentAsFirst(result)))
      .pipe(withLatestFrom(of(this.lookupService.listByCategory.MenuType)))
      .pipe(switchMap(([menus, groups]) => {
        this.buildPermissionGroups(groups, menus);
        this.groupHandler = new CheckGroupHandler<CustomMenu>(this.permissionGroups,
          undefined,
          (item: CustomMenu, isChecked: boolean, group: CheckGroup<CustomMenu>) => this.onPermissionChanged(item, isChecked, group)
        );
        return of(true);
      }))
      .pipe(switchMap(_ => this.user.generalUserId ? this.userCustomMenuService.loadByCriteria({generalUserId: this.user.generalUserId}) : of([])))
      .subscribe((userCustomMenus: UserCustomMenu[]) => {
        this.groupHandler.setSelection(userCustomMenus.map(p => p.menuItemId));
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

  private _sortMenusSetParentAsFirst(menus: CustomMenu[]): CustomMenu[] {
    let result: CustomMenu[] = [];
    let parents: CustomMenu[] = [], parentChildrenMap = new Map<number, CustomMenu[]>;
    menus.map((menu) => {
      if (!menu.parentMenuItemId) {
        parents.push(menu);
      } else {
        parentChildrenMap.set(menu.parentMenuItemId, (parentChildrenMap.get(menu.parentMenuItemId) ?? []).concat(menu));
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
    return result;
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

  saveUserCustomMenuPermissions(): Observable<UserCustomMenu[]> {
    const selection: number[] = this.groupHandler.getSelection().filter((item, index, list) => list.indexOf(item) === index);
    return this.userCustomMenuService.saveUserCustomMenu(this.user.generalUserId, selection);
  }

  printPermissions($event: MouseEvent): void {
    $event?.preventDefault();
    this.userCustomMenuService.loadPermissionsAsBlob(this.user.generalUserId)
      .subscribe((data) => {
        this.sharedService.downloadFileToSystem(data, 'UserCustomMenuPermission_' + this.user.getName());
      });
  }
}
