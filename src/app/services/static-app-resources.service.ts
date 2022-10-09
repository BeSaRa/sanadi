import { Injectable } from '@angular/core';
import {Observable, of} from 'rxjs';
import {navigationMenuList} from '@app/resources/navigation-menu-list';
import {PermissionGroupsEnum} from '@app/enums/permission-groups-enum';
import {PermissionsGroupMap} from '@app/resources/permission-groups';
import {FactoryService} from '@services/factory.service';
import {PermissionGroupsMapResponseType} from '@app/types/types';

@Injectable({
  providedIn: 'root'
})
export class StaticAppResourcesService {
  private _permissionGroupsMap = PermissionsGroupMap;

  constructor() {
    FactoryService.registerService('StaticAppResourcesService', this);
  }

  getMenuList(): Observable<any[]> {
    return of(navigationMenuList);
  }

  getPermissionsListByGroup(groupName: PermissionGroupsEnum): PermissionGroupsMapResponseType {
    if (!groupName || !this._permissionGroupsMap[groupName]) {
      return [];
    }
    return this._permissionGroupsMap[groupName] || [];
  }
}
