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
import {Team} from '../models/team';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private orgBranch?: OrgBranch;
  private orgUnit?: OrgUnit;
  private orgUser?: OrgUser;
  private internalUser?: InternalUser;
  private internalDepartment?: InternalDepartment;
  private permissions?: Permission[];
  private permissionMap: Map<string, Permission> = new Map<string, Permission>();
  private type!: UserTypes;

  public internalDepartments?: InternalDepartment[];
  public teams: Team[] = [];

  constructor() {
    FactoryService.registerService('EmployeeService', this);
  }


  setExternalUserData(loginData: ILoginData): void {
    this.orgUser = (new OrgUser()).clone(loginData.orgUser);
    this.orgBranch = (new OrgBranch()).clone(loginData.orgBranch);
    this.orgUnit = (new OrgUnit()).clone(loginData.orgUnit);
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
    this.teams = [];
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
    this.type = loginData.type;
    this.permissions = loginData.permissionSet.map(permission => (new Permission()).clone(permission));
    this.teams = loginData.teams.map(item => (new Team()).clone(item));
    this.setUserData(loginData);
    this.preparePermissionMap();
  }

  private setUserData(loginData: ILoginData) {
    this.type === UserTypes.EXTERNAL ? this.setExternalUserData(loginData) : this.setInternalUserData(loginData);
  }

  private setInternalUserData(loginData: ILoginData) {
    loginData.internalDepartment.mainTeam = new Team().clone(loginData.internalDepartment.mainTeam);
    this.internalUser = (new InternalUser()).clone(loginData.internalUser);
    this.internalDepartment = (new InternalDepartment()).clone(loginData.internalDepartment);
    this.internalDepartments = loginData.internalDepartments.map(item => (new InternalDepartment()).clone(item));
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

  getCurrentUser(): InternalUser | OrgUser {
    return this.isInternalUser() ? this.getInternalUser()! : this.getUser()!;
  }
}
