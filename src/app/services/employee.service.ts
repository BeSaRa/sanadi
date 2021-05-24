import {Injectable} from '@angular/core';
import {FactoryService} from './factory.service';
import {OrgUser} from '../models/org-user';
import {OrgBranch} from '../models/org-branch';
import {OrgUnit} from '../models/org-unit';
import {Permission} from '../models/permission';
import {isValidValue} from '../helpers/utils';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private orgBranch?: OrgBranch;
  private orgUnit?: OrgUnit;
  private orgUser?: OrgUser;
  private permissions?: Permission[];
  private permissionMap: Map<string, Permission> = new Map<string, Permission>();

  constructor() {
    FactoryService.registerService('EmployeeService', this);
  }


  setCurrentEmployeeData(orgUser: any, orgBranch: any, orgUnit: any, permissions: Permission[]): void {
    this.orgUser = (new OrgUser()).clone(orgUser);
    this.orgBranch = (new OrgBranch()).clone(orgBranch);
    this.orgUnit = (new OrgUnit()).clone(orgUnit);
    this.permissions = permissions.map(permission => (new Permission()).clone(permission));
    this.preparePermissionMap();
  }

  clear(): void {
    this.orgBranch = undefined;
    this.orgUnit = undefined;
    this.orgUser = undefined;
    this.permissions = undefined;
    this.permissionMap.clear();
  }

  getUser(): OrgUser | undefined {
    return this.orgUser;
  }

  getBranch(): OrgBranch | undefined {
    return this.orgBranch;
  }

  getOrgUnit(): OrgUnit | undefined {
    return this.orgUnit;
  }

  getPermissions(): Permission[] | undefined {
    return this.permissions;
  }

  private preparePermissionMap() {
    this.permissionMap.clear();
    this.permissions?.map(permission => this.permissionMap.set(permission.permissionKey.toLowerCase(), permission));
  }

  /**
   * to check for one permission
   * @param permissionKey
   */
  hasPermissionTo(permissionKey: string): boolean {
    return this.permissionMap.has(permissionKey.toLowerCase());
  }

  /**
   * to check if user has one permission at least
   * @param permissionKeys
   */
  hasAnyPermissions(permissionKeys: string[]): boolean {
    return permissionKeys.some(key => {
      return this.hasPermissionTo(key);
    });
  }

  /**
   * to check if the user has all mentioned permissions
   * @param permissionKeys
   */
  hasAllPermissions(permissionKeys: string[]): boolean {
    return !(permissionKeys.some(key => {
      return !this.hasPermissionTo(key);
    }));
  }

  /**
   * @description Check if user has given permission or permissions
   * @param permissionKey: string | string[]
   * @param bulkPermissionsCheckAny: boolean
   */
  checkPermissions(permissionKey: string | string[], bulkPermissionsCheckAny: boolean = false): boolean {
    if (!isValidValue(permissionKey)) {
      return true;
    }
    if (typeof permissionKey === 'string') {
      return this.hasPermissionTo(permissionKey as string);
    } else {
      if (bulkPermissionsCheckAny) {
        return this.hasAnyPermissions(permissionKey as string[]);
      }
      return this.hasAllPermissions(permissionKey as string[]);
    }
  }

  isCurrentEmployee(user: OrgUser): boolean {
    return this.orgUser?.id === user.id;
  }
}
