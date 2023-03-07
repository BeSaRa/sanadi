import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {navigationMenuList} from '@app/resources/navigation-menu-list';
import {newNavigationMenuList} from '@app/resources/new-navigation-menu-list';
import {PermissionGroupsEnum} from '@app/enums/permission-groups-enum';
import {PermissionsGroupMap} from '@app/resources/permission-groups';
import {FactoryService} from '@services/factory.service';
import {ConfigurationMergingScope, PermissionGroupsMapResponseType, PermissionGroupsMapType} from '@app/types/types';
import {reportsMenuList} from '@app/resources/reports-menu-list';
import {ReportContract} from '@contracts/report-contract';
import {urlsList} from '@app/resources/urls-list';
import {IAppUrls} from '@contracts/i-app-urls';
import {IAppConfig} from '@contracts/i-app-config';
import {
  defaultConfiguration,
  limitedConfigurableProperties,
  extendedConfigurableProperties,
  configurationMergingLevel
} from '@app/resources/default-configuration';
import {CommonUtils} from '@helpers/common-utils';

@Injectable({
  providedIn: 'root'
})
export class StaticAppResourcesService {
  private _permissionGroupsMap = PermissionsGroupMap;
  private _mergingScope: ConfigurationMergingScope = configurationMergingLevel;
  private _mergingProperties: Array<keyof IAppConfig> = [];

  constructor() {
    FactoryService.registerService('StaticAppResourcesService', this);
  }

  getConfigurationMergeScope(): ConfigurationMergingScope {
    return this._mergingScope;
  }

  setConfigurationMergingProperties(propertyList: Array<keyof IAppConfig>) {
    this._mergingProperties = propertyList;
  }

  getDefaultConfiguration(): Partial<IAppConfig> {
    return defaultConfiguration;
  }

  /**
   * @description Get the list of properties to be merged
   * if mergingLevel = 'open', return []
   */
  getConfigurableProperties(): Array<keyof IAppConfig> {
    if (this._mergingScope === 'limited') {
      return limitedConfigurableProperties;
    } else if (this._mergingScope === 'extended') {
      return limitedConfigurableProperties.concat(extendedConfigurableProperties);
    } else if (this._mergingScope === 'open') {
      return []; // return empty as all properties are merge-able
    }
    return [];
  }

  getConfigurablePropertiesForConsole(): { scope: string, properties: Array<keyof IAppConfig> } {
    return {scope: this._mergingScope, properties: this._mergingProperties.sort()};
  }

  getPrivateBuildForConsole(): string {
    if (!defaultConfiguration || !CommonUtils.isValidValue(defaultConfiguration.VERSION)) {
      return '';
    }
    if (CommonUtils.isValidValue(defaultConfiguration.PRIVATE_VERSION)) {
      return defaultConfiguration.VERSION + ' | ' + defaultConfiguration.PRIVATE_VERSION!.trim();
    }
    return defaultConfiguration.VERSION!;
  }

  getUrls(): Observable<IAppUrls> {
    return of(urlsList as unknown as IAppUrls);
  }

  getMenuList(): Observable<any[]> {
    return of(newNavigationMenuList);
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
