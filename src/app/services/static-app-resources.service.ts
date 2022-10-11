import { Injectable } from '@angular/core';
import {Observable, of} from 'rxjs';
import {navigationMenuList} from '@app/resources/navigation-menu-list';
import {PermissionGroupsEnum} from '@app/enums/permission-groups-enum';
import {PermissionsGroupMap} from '@app/resources/permission-groups';
import {FactoryService} from '@services/factory.service';
import {PermissionGroupsMapResponseType} from '@app/types/types';
import {reportsMenuList} from '@app/resources/reports-menu-list';
import {ReportContract} from '@contracts/report-contract';
import {urlsList} from '@app/resources/urls-list';
import {IAppUrls} from '@contracts/i-app-urls';

@Injectable({
  providedIn: 'root'
})
export class StaticAppResourcesService {
  private _permissionGroupsMap = PermissionsGroupMap;

  constructor() {
    FactoryService.registerService('StaticAppResourcesService', this);
  }

  getUrls(): Observable<IAppUrls> {
    return of(urlsList as unknown as IAppUrls);
  }

  getMenuList(): Observable<any[]> {
    return of(navigationMenuList);
  }

  getReportsMenuList(): Observable<ReportContract[]> {
    return of(reportsMenuList as ReportContract[]);
  }

  getPermissionsListByGroup(groupName: PermissionGroupsEnum): PermissionGroupsMapResponseType {
    if (!groupName || !this._permissionGroupsMap[groupName]) {
      return [];
    }
    return this._permissionGroupsMap[groupName] || [];
  }
}
