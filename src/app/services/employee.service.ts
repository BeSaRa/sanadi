import { Injectable } from '@angular/core';
import { FactoryService } from './factory.service';
import { ExternalUser } from '../models/external-user';
import { Permission } from '../models/permission';
import { isValidValue } from '@helpers/utils';
import { ILoginData } from '@contracts/i-login-data';
import { UserTypes } from '../enums/user-types.enum';
import { InternalUser } from '../models/internal-user';
import { InternalDepartment } from '../models/internal-department';
import { Team } from '../models/team';
import { CommonUtils } from '@app/helpers/common-utils';
import { IUserSecurity } from '@app/interfaces/iuser-security';
import { UserSecurityConfiguration } from '@app/models/user-security-configuration';
import { CaseTypes } from '@app/enums/case-types.enum';
import { EServicePermissionsEnum } from '@app/enums/e-service-permissions-enum';
import { ConfigurationService } from '@app/services/configuration.service';
import { PermissionsEnum } from '@app/enums/permissions-enum';
import { Profile } from '@app/models/profile';
import { PermissionGroupsEnum } from '@app/enums/permission-groups-enum';
import { StaticAppResourcesService } from '@services/static-app-resources.service';
import { ProfileTypes } from '@app/enums/profile-types.enum';
import { CustomMenu } from '@app/models/custom-menu';
import { CustomMenuInterceptor } from '@app/model-interceptors/custom-menu-interceptor';
import { ProfileInterceptor } from '@app/model-interceptors/profile-interceptor';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { UserRoleManageUserContract } from '@contracts/user-role-manage-user-contract';
import { InternalUserInterceptor } from '@model-interceptors/internal-user-interceptor';
import { ExternalUserInterceptor } from '@model-interceptors/external-user-interceptor';
import { SubmissionMechanisms } from '@app/enums/submission-mechanisms.enum';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private externalUser?: ExternalUser;
  private internalUser?: InternalUser;
  private internalDepartment?: InternalDepartment;
  private permissions?: Permission[];
  private permissionMap: Map<string, Permission> = new Map<string, Permission>();
  private type!: UserTypes;
  private profile?: Profile;

  public internalDepartments?: InternalDepartment[];
  public teams: Team[] = [];
  public menuItems: CustomMenu[] = [];
  private userSecConfig?: Record<number, UserSecurityConfiguration[]>;
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
    },
    supervisionAndControlSecretary: {
      authName: 'Supervision and Control Manager',
      ldapGroupName: 'Supervision_and_Control_Manager'
    },
    internationalCooperation: {
      authName: 'International Cooperation',
      ldapGroupName: '"International_Cooperation_STG"'
    },
    legalAffairs: {
      authName: 'Legal Affairs',
      ldapGroupName: '"LA1_DEPT"'
    },
    projectSpecialist:{
      authName: 'Project Specialist',
      ldapGroupName: '"ES_Projects_Specialist"'
    }
  };
  private customMenuInterceptor = new CustomMenuInterceptor();
  private profileInterceptor = new ProfileInterceptor();
  public isToggledToDefaultLanguage: boolean = false;

  public userRolesManageUser: UserRoleManageUserContract = {
    isSuperAdmin: (operation: OperationTypes) => this._manageUserSuperAdmin(operation),
    isActingSuperAdmin: () => this._manageUserActingSuperAdmin(),
    isSubAdmin: () => this._manageUserSubAdmin(),
    isApprovalAdmin: () => this._manageUserApprovalAdmin(),
  };

  constructor(private configService: ConfigurationService,
    private staticResourcesService: StaticAppResourcesService) {
    FactoryService.registerService('EmployeeService', this);
  }

  setExternalUserData(loginData: ILoginData): void {
    this.externalUser = new ExternalUserInterceptor().receive(new ExternalUser().clone(loginData.externalUser));
    this.profile = this.profileInterceptor.receive((new Profile()).clone(loginData.profile));
  }

  clear(): void {
    this.externalUser = undefined;
    this.profile = undefined;
    this.permissions = undefined;
    this.internalUser = undefined;
    this.internalDepartment = undefined;
    this.internalDepartments = undefined;
    this.permissionMap.clear();
    this.teams = [];
    this.menuItems = [];
    this.isToggledToDefaultLanguage = false;
  }

  getExternalUser(): ExternalUser | undefined {
    return this.externalUser;
  }

  getPermissions(): Permission[] {
    return this.permissions || [];
  }

  getProfile(): Profile | undefined {
    return this.profile;
  }

  isCharityProfile(): boolean {
    return this.profile?.profileType === ProfileTypes.CHARITY;
  }

  isInstitutionProfile(): boolean {
    return this.profile?.profileType === ProfileTypes.INSTITUTION;
  }

  isNonProfitOrgProfile(): boolean {
    return this.profile?.profileType === ProfileTypes.NON_PROFIT_ORGANIZATIONS;
  }

  private preparePermissionMap() {
    this.permissionMap.clear();
    this.getPermissions().map(permission => this.permissionMap?.set(permission.permissionKey.toLowerCase(), permission));
  }

  /**
   * to check for one permission
   * @param permissionKey
   */
  hasPermissionTo(permissionKey: PermissionsEnum | string): boolean {
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

  isCurrentUser(user: ExternalUser | InternalUser): boolean {
    return this.getCurrentUser()?.generalUserId === user.generalUserId;
  }

  fillCurrentEmployeeData(loginData: ILoginData) {
    this.type = loginData.type;
    this.menuItems = loginData.menuItems.map(customMenu => this.customMenuInterceptor.receive((new CustomMenu()).clone(customMenu)));
    this.permissions = loginData.permissionSet.map(permission => (new Permission()).clone(permission));
    this.teams = loginData.teams.map(item => (new Team()).clone(item));
    this.userSecConfig = loginData.userSecConfig;
    this.teams.length ? this.permissions.push((new Permission().clone({
      permissionKey: EServicePermissionsEnum.TEAM_INBOX
    }))) : null;

    // add static team called all with id -1 to load all teams items
    if (this.teams.length) {
      this.teams = [new Team().clone({
        arName: 'الكل',
        enName: 'All',
        id: -1
      }), ...this.teams];
    }

    let userForcedPermissions = this.staticResourcesService.getPermissionsListByGroup(PermissionGroupsEnum.GIVE_USERS_PERMISSIONS) as string[];
    if (this.configService.CONFIG.GIVE_USERS_PERMISSIONS && this.configService.CONFIG.GIVE_USERS_PERMISSIONS.length > 0) {
      userForcedPermissions = this.configService.CONFIG.GIVE_USERS_PERMISSIONS;
    }

    (userForcedPermissions ?? []).forEach((permission) => {
      this.permissions?.push(new Permission().clone({
        permissionKey: permission
      }));
    });
    this.setUserData(loginData);
    this._setPrePermissionMapCustomPermissions();
    this.preparePermissionMap();
    this._setPostPermissionMapCustomPermissions();
    this.prepareUserSecurityMap();
  }

  private _addToPermissions(permissionKey: string) {
    this.permissions?.push(new Permission().clone({
      permissionKey: permissionKey
    }));
  }

  private _addToPermissionMap(permissionKey: string) {
    this.permissionMap.set(permissionKey.toLowerCase(), new Permission().clone({
      permissionKey: permissionKey
    }));
  }

  private _setPrePermissionMapCustomPermissions(): void {
    // this._addToPermissions('TEST');
  }

  private _setPostPermissionMapCustomPermissions(): void {
    // (super admin or (sub admin, acting super admin with permission )) can access external user screen
    const hasExternalUserAccess = (this.userRolesManageUser.isSuperAdmin(OperationTypes.CREATE) || this.userRolesManageUser.isSuperAdmin(OperationTypes.UPDATE))
      ||
      // (
      (this.userRolesManageUser.isActingSuperAdmin() || this.userRolesManageUser.isSubAdmin())
    // && this.checkPermissions(PermissionsGroupMap.MANAGE_EXTERNAL_USER_PERMISSIONS_GROUP, true));
    hasExternalUserAccess && this._addToPermissionMap(PermissionsEnum.MANAGE_EXTERNAL_USER_DYNAMIC);

    // (sub admin, approval admin, acting super admin, super admin) can access external user request approval screen
    const hasExternalUserRequestApprovalAccess = this.userRolesManageUser.isSubAdmin() || this.userRolesManageUser.isApprovalAdmin()
      || this.userRolesManageUser.isSuperAdmin(OperationTypes.UPDATE);
    hasExternalUserRequestApprovalAccess && this._addToPermissionMap(PermissionsEnum.MANAGE_EXTERNAL_USER_REQUEST_APPROVALS_DYNAMIC);
  }

  private setUserData(loginData: ILoginData) {
    this.type === UserTypes.EXTERNAL ? this.setExternalUserData(loginData) : this.setInternalUserData(loginData);
  }

  private setInternalUserData(loginData: ILoginData) {
    loginData.internalDepartment.mainTeam = new Team().clone(loginData.internalDepartment.mainTeam);
    this.internalUser = new InternalUserInterceptor().receive((new InternalUser()).clone(loginData.internalUser));
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
    return this.isInternalUser() ? this.getInternalUser()?.getName() : this.getExternalUser()?.getName();
  }

  getCurrentUserDepartment(): string {
    return (this.isExternalUser() ? this.getExternalUserDepartment() : this.getInternalUserDepartment());
  }

  getExternalUserDepartment(): string {
    return this.profile?.getName() ?? '';// this.getOrgUnit()?.getName() + ' - ' + this.getBranch()?.getName();
  }

  getInternalUserDepartment(): string {
    return this.getInternalDepartment()?.getName() + '';
  }

  loggedIn(): boolean {
    return !!this.externalUser || !!this.internalUser;
  }

  getCurrentUser(): InternalUser | ExternalUser {
    return this.isInternalUser() ? this.getInternalUser()! : this.getExternalUser()!;
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
  isProjectSpecialistUser(compareBy: 'authName' | 'ldapGroupName' = 'authName'): boolean {
    return this._isInTeam(this.userTeamsMap.projectSpecialist, compareBy);
  }
  isInternationalCooperationUser(compareBy: 'authName' | 'ldapGroupName' = 'authName'): boolean {
    return this._isInTeam(this.userTeamsMap.internationalCooperation, compareBy);
  }

  isRiskAndComplianceUser(compareBy: 'authName' | 'ldapGroupName' = 'authName'): boolean {
    return this._isInTeam(this.userTeamsMap.riskAndComplianceUser, compareBy);
  }
  isLegalAffairsUser(compareBy: 'authName' | 'ldapGroupName' = 'authName'): boolean {
    return this._isInTeam(this.userTeamsMap.legalAffairs, compareBy);
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

  isSupervisionAndControlSecretary(compareBy: 'authName' | 'ldapGroupName' = 'authName'): boolean {
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
    let hasFollowupPermission = false;
    if (!keys) {
      return;
    }

    const securityArray = keys.reduce((acc, key: string) => {
      const list = this.userSecConfig ? this.userSecConfig[key as unknown as number] : [];
      return [...acc, ...list];
    }, [] as UserSecurityConfiguration[]);

    securityArray.forEach((item) => {
      if (this.type == UserTypes.EXTERNAL && item.followUp && !hasFollowupPermission) {
        this.permissionMap?.set('external_followup', new Permission().clone({
          permissionKey: PermissionsEnum.EXTERNAL_FOLLOWUP
        }));
        hasFollowupPermission = true;
      }
      this.addUserSecurityToMap(item);
    });
    this.generateEServicesPermissions();
  }

  private userCan(caseType: number, key: keyof (Pick<UserSecurityConfiguration, 'canAdd' | 'canView' | 'canManage' | 'followUp'>)): boolean {
    return !!(this.userSecurityMap.has(caseType) && this.userSecurityMap.get(caseType)!.override[key]);
  }

  userCanAdd(caseType: number): boolean {
    if (caseType != CaseTypes.PROJECT_FUNDRAISING) {
      return this.userCan(caseType, 'canAdd');
    } else {
      const profile = this.getProfile();
      if (!profile) {
        return this.userCan(caseType, 'canAdd')
      } else {
        const allowed = profile.getParsedPermitTypes()
        return !!allowed.length && this.userCan(caseType, 'canAdd');
      };
    }
  }

  userCanManage(caseType: number): boolean {
    return this.userCan(caseType, 'canManage');
  }

  userCanView(caseType: number): boolean {
    return this.userCan(caseType, 'canView');
  }

  userCanFollowUp(caseType: number): boolean {
    return this.userCan(caseType, 'followUp');
  }


  private generateEServicesPermissions() {
    let canSearch = false;
    this.userSecurityMap.forEach((value, key: CaseTypes) => {
      const permissionKey = CaseTypes[key];
      if (!permissionKey) {
        return;
      }
      this.userCanAdd(key) && this._addToPermissionMap(permissionKey);
      this.userCanManage(key) && this._addToPermissionMap(EServicePermissionsEnum.SEARCH_SERVICE_PREFIX + permissionKey);
      if (!canSearch) {
        canSearch = this.userCanManage(key);
      }
      if (key === CaseTypes.PROJECT_FUNDRAISING) {
        this.userCanView(key) && this._addToPermissionMap(EServicePermissionsEnum.COLLECTED_FUNDS);
      }
    });
    canSearch && this.permissionMap.set(EServicePermissionsEnum.E_SERVICES_SEARCH.toLowerCase(), new Permission().clone({
      permissionKey: EServicePermissionsEnum.E_SERVICES_SEARCH
    }));
  }

  addFollowupPermission(permission: string): void {
    this.permissionMap.set(permission.toLowerCase(), new Permission().clone({
      permissionKey: permission
    }));
  }

  private _manageUserSuperAdmin(operation: OperationTypes): boolean {
    if (this.isExternalUser()) {
      return false;
    }
    if (operation === OperationTypes.CREATE) {
      return this.checkPermissions(PermissionsEnum.ADD_ORG_USER);
    } else {
      return this.checkPermissions(PermissionsEnum.EDIT_ORG_USER);
    }
  }

  private _manageUserActingSuperAdmin(): boolean {
    return this._manageUserSubAdmin() && this._manageUserApprovalAdmin();
  }

  private _manageUserSubAdmin(): boolean {
    return this.isExternalUser() && this.checkPermissions(PermissionsEnum.SUB_ADMIN);
  }

  private _manageUserApprovalAdmin(): boolean {
    return this.isExternalUser() && this.checkPermissions(PermissionsEnum.APPROVAL_ADMIN);
  }

  hasRegistrationProfile(): boolean {
    return this.profile?.submissionMechanism === SubmissionMechanisms.REGISTRATION
  }
  hasNotificationProfile(): boolean {
    return this.profile?.submissionMechanism === SubmissionMechanisms.NOTIFICATION
  }
  hasSubmissionProfile(): boolean {
    return this.profile?.submissionMechanism === SubmissionMechanisms.SUBMISSION
  }

  get canSeeTeamInbox() {
    return Object.values(this.userSecConfig??[]).reduce((acc,x)=>acc.concat(x),[]).some(x=>x.canView)
  }
}
