import {Injectable} from '@angular/core';
import {FactoryService} from './factory.service';
import {OrgUser} from '../models/org-user';
import {OrgBranch} from '../models/org-branch';
import {OrgUnit} from '../models/org-unit';
import {Permission} from '../models/permission';
import {isValidValue} from '../helpers/utils';
import {ILoginData} from '../interfaces/i-login-data';
import {UserTypes} from '../enums/user-types.enum';
import {InternalUser} from '../models/internal-user';
import {InternalDepartment} from '../models/internal-department';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private orgBranch?: OrgBranch;
  private orgUnit?: OrgUnit;
  private orgUser?: OrgUser;
  private internalUser?: InternalUser;
  private internalDepartment?: InternalDepartment;
  private internalDepartments?: InternalDepartment[];
  private permissions?: Permission[];
  private permissionMap: Map<string, Permission> = new Map<string, Permission>();
  private type!: UserTypes;

  constructor() {
    FactoryService.registerService('EmployeeService', this);
  }


  setExternalUserData(orgUser: any, orgBranch: any, orgUnit: any, permissions: Permission[]): void {
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
    this.internalUser = undefined;
    this.internalDepartment = undefined;
    this.internalDepartments = undefined;
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

  getPermissions(): Permission[] {
    return this.permissions || [];
  }

  private preparePermissionMap() {
    this.permissionMap.clear();
    this.getPermissions().map(permission => this.permissionMap?.set(permission.permissionKey.toLowerCase(), permission));
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

  fillCurrentEmployeeData(loginData: ILoginData) {
    if (loginData.type === UserTypes.EXTERNAL) {
      this.setExternalUserData(loginData.orgUser, loginData.orgBranch, loginData.orgUnit, loginData.permissionSet);
    } else {
      this.setInternalUserData(loginData.internalUser, loginData.internalDepartment, loginData.internalDepartments, loginData.permissionSet);
    }
    this.type = loginData.type;
  }

  private setInternalUserData(orgUser: InternalUser,
                              department: InternalDepartment,
                              internalDepartments: InternalDepartment[],
                              permissionSet: Permission[]) {
    this.internalUser = (new InternalUser()).clone(orgUser);
    this.internalDepartment = (new InternalDepartment()).clone(department);
    this.internalDepartments = internalDepartments.map(item => (new InternalDepartment()).clone(item));
    this.permissions = permissionSet.map(permission => (new Permission()).clone(permission));
    this.preparePermissionMap();
  }

  isExternalUser(): boolean {
    return this.type === UserTypes.EXTERNAL;
  }

  isInternalUser(): boolean {
    return this.type === UserTypes.INTERNAL;
  }

  getInternalDepartment(): InternalDepartment | undefined {
    return this.internalDepartment;
  }

  getInternalUser(): InternalUser | undefined {
    return this.internalUser;
  }

  getCurrentUserName(): string | undefined {
    return this.isInternalUser() ? this.getInternalUser()?.getName() : this.getUser()?.getName();
  }

  getCurrentUserDepartment(): string {
    return (this.isExternalUser() ? this.getExternalUserDepartment() : this.getInternalUserDepartment());
  }

  getExternalUserDepartment(): string {
    return this.getOrgUnit()?.getName() + ' - ' + this.getBranch()?.getName();
  }

  getInternalUserDepartment(): string {
    return this.getInternalDepartment()?.getName() + '';
  }

  loggedIn(): boolean {
    return !!this.orgUser || !!this.internalUser;
  }
}
