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
import {CommonUtils} from '@app/helpers/common-utils';
import {IUserSecurity} from "@app/interfaces/iuser-security";
import {UserSecurityConfiguration} from "@app/models/user-security-configuration";
import {CaseTypes} from "@app/enums/case-types.enum";
import {EServicePermissions} from "@app/enums/e-service-permissions";
import {ConfigurationService} from "@app/services/configuration.service";

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
  private userSecConfig?: Record<number, UserSecurityConfiguration[]>
  public userSecurityMap: Map<number, IUserSecurity> = new Map<number, IUserSecurity>();

  private userTeamsMap = {
    charityUser: {
      authName: 'Charity Organization',
      ldapGroupName: 'Charity Organization'
    },
    charityManager: {
      authName: 'Charity Organization Manager',
      ldapGroupName: 'Charity_Organization_Manager'
    },
    licenseUser: {
      authName: 'Licenses',
      ldapGroupName: 'Licenses'
    },
    licenseManager: {
      authName: 'Licenses Manager',
      ldapGroupName: 'Licenses_Manager'
    },
    licenseChiefManager: {
      authName: 'Licenses Chief',
      ldapGroupName: 'Licenses_Chief'
    },
    licenseGeneralManager: {
      authName: 'Licenses General Manager',
      ldapGroupName: 'Licenses_General_Manager'
    },
    riskAndComplianceUser: {
      authName: 'Risk and Compliance',
      ldapGroupName: 'Risk and Compliance'
    },
    constructionExpert: {
      authName: 'Construction Experts',
      ldapGroupName: 'Construction_Experts'
    },
    developmentalExpert: {
      authName: 'Developmental Experts',
      ldapGroupName: 'Developmental_ Experts'
    },
    supervisionAndControlUser: {
      authName: 'Supervision and Control',
      ldapGroupName: 'Supervision_and_Control'
    },
    supervisionAndControlManager: {
      authName: 'Supervision and Control Manager',
      ldapGroupName: 'Supervision_and_Control_Manager'
    }
  };

  constructor(private configService: ConfigurationService) {
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
    this.userSecConfig = loginData.userSecConfig;
    this.teams.length ? this.permissions.push((new Permission().clone({
      permissionKey: 'TEAM_INBOX'
    }))) : null;

    this.configService.CONFIG.GIVE_USERS_PERMISSIONS && this.configService.CONFIG.GIVE_USERS_PERMISSIONS.forEach((permission) => {
      console.log(permission);
      this.permissions?.push(new Permission().clone({
        permissionKey: permission
      }));
    })
    this.permissions.push()
    this.setUserData(loginData);
    this.preparePermissionMap();
    this.prepareUserSecurityMap();
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

  private _isInTeam(team: { authName: string, ldapGroupName: string }, compareBy: 'authName' | 'ldapGroupName' = 'authName') {
    if (!this.teams.length || !CommonUtils.isValidValue(team)) {
      return false;
    }
    return this.teams.some(x => {
      if (compareBy === 'authName') {
        return CommonUtils.isValidValue(x.authName) && CommonUtils.isValidValue(team.authName) && x.authName.toLowerCase() === team.authName.toLowerCase();
      } else if (compareBy === 'ldapGroupName') {
        return CommonUtils.isValidValue(x.ldapGroupName) && CommonUtils.isValidValue(team.ldapGroupName) && x.ldapGroupName.toLowerCase() === team.ldapGroupName.toLowerCase();
      }
      return false;
    });
  }

  isCharityUser(compareBy: 'authName' | 'ldapGroupName' = 'authName'): boolean {
    return this._isInTeam(this.userTeamsMap.charityUser, compareBy);
  }

  isCharityManager(compareBy: 'authName' | 'ldapGroupName' = 'authName'): boolean {
    return this._isInTeam(this.userTeamsMap.charityManager, compareBy);
  }

  isLicensingUser(compareBy: 'authName' | 'ldapGroupName' = 'authName'): boolean {
    return this._isInTeam(this.userTeamsMap.licenseUser, compareBy);
  }

  isLicensingManager(compareBy: 'authName' | 'ldapGroupName' = 'authName'): boolean {
    return this._isInTeam(this.userTeamsMap.licenseManager, compareBy);
  }

  isLicensingGeneralManager(compareBy: 'authName' | 'ldapGroupName' = 'authName'): boolean {
    return this._isInTeam(this.userTeamsMap.licenseGeneralManager, compareBy);
  }

  isLicensingChiefManager(compareBy: 'authName' | 'ldapGroupName' = 'authName'): boolean {
    return this._isInTeam(this.userTeamsMap.licenseChiefManager, compareBy);
  }

  isRiskAndComplianceUser(compareBy: 'authName' | 'ldapGroupName' = 'authName'): boolean {
    return this._isInTeam(this.userTeamsMap.riskAndComplianceUser, compareBy);
  }

  isConstructionExpert(compareBy: 'authName' | 'ldapGroupName' = 'authName'): boolean {
    return this._isInTeam(this.userTeamsMap.constructionExpert, compareBy);
  }

  isDevelopmentalExpert(compareBy: 'authName' | 'ldapGroupName' = 'authName'): boolean {
    return this._isInTeam(this.userTeamsMap.developmentalExpert, compareBy);
  }

  isSupervisionAndControlUser(compareBy: 'authName' | 'ldapGroupName' = 'authName'): boolean {
    return this._isInTeam(this.userTeamsMap.supervisionAndControlUser, compareBy);
  }

  isSupervisionAndControlManager(compareBy: 'authName' | 'ldapGroupName' = 'authName'): boolean {
    return this._isInTeam(this.userTeamsMap.supervisionAndControlManager, compareBy);
  }

  private addUserSecurityToMap(item: UserSecurityConfiguration): void {
    if (this.userSecurityMap.has(item.caseType)) {
      const model = this.userSecurityMap.get(item.caseType)!;
      const list = [...model.list].concat([item]);
      this.userSecurityMap.set(item.caseType, {
        list: list,
        override: {
          ...item,
          canAdd: model.override.canAdd ? model.override.canAdd : list.some(i => i.canAdd),
          canManage: model.override.canManage ? model.override.canManage : list.some(i => i.canManage),
          canView: model.override.canView ? model.override.canView : list.some(i => i.canView)
        }
      });
    } else {
      this.userSecurityMap.set(item.caseType, {
        list: [item],
        override: item
      });
    }
  }

  private prepareUserSecurityMap(): void {
    this.userSecurityMap.clear();
    const keys = this.userSecConfig && Object.keys(this.userSecConfig);
    if (!keys) {
      return;
    }

    const securityArray = keys.reduce((acc, key: string) => {
      const list = this.userSecConfig ? this.userSecConfig[key as unknown as number] : []
      return [...acc, ...list];
    }, [] as UserSecurityConfiguration[]);

    securityArray.forEach((item) => this.addUserSecurityToMap(item));
    this.generateEServicesPermissions();
  }

  private userCan(caseType: number, key: keyof (Pick<UserSecurityConfiguration, 'canAdd' | 'canView' | 'canManage'>)): boolean {
    return !!(this.userSecurityMap.has(caseType) && this.userSecurityMap.get(caseType)!.override[key])
  }

  userCanAdd(caseType: number): boolean {
    return this.userCan(caseType, 'canAdd');
  }

  userCanManage(caseType: number): boolean {
    return this.userCan(caseType, 'canManage');
  }

  userCanView(caseType: number): boolean {
    return this.userCan(caseType, 'canView');
  }


  private generateEServicesPermissions() {
    let canSearch = false;
    this.userSecurityMap.forEach((value, key: CaseTypes) => {
      const permissionKey = CaseTypes[key];
      this.userCanAdd(key) && this.permissionMap
        .set(permissionKey.toLowerCase(), new Permission().clone({
          permissionKey
        }));
      if (!canSearch) {
        canSearch = this.userCanManage(key);
      }
    });
    canSearch && this.permissionMap.set(EServicePermissions.E_SERVICES_SEARCH.toLowerCase(), new Permission().clone({
      permissionKey: EServicePermissions.E_SERVICES_SEARCH
    }))
  }
}
