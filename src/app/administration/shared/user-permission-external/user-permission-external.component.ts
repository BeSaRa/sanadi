import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ExternalUserUpdateRequest} from "@models/external-user-update-request";
import {ExternalUser} from "@models/external-user";
import {of, Subject} from "rxjs";
import {LangService} from "@services/lang.service";
import {LookupService} from "@services/lookup.service";
import {Permission} from "@models/permission";
import {CheckGroup} from "@models/check-group";
import {CheckGroupHandler} from "@models/check-group-handler";
import {CustomRole} from "@models/custom-role";
import {delay, map, switchMap, takeUntil, tap, withLatestFrom} from "rxjs/operators";
import {EmployeeService} from "@services/employee.service";
import {PermissionService} from "@services/permission.service";
import {Lookup} from "@models/lookup";
import {PermissionsEnum} from "@enums/permissions-enum";
import {UserPermissionGroupsEnum} from "@enums/user-permission-groups.enum";
import {OperationTypes} from "@enums/operation-types.enum";
import {ExternalUserPermission} from "@models/external-user-permission";

@Component({
  selector: 'user-permission-external',
  templateUrl: './user-permission-external.component.html',
  styleUrls: ['./user-permission-external.component.scss']
})
export class UserPermissionExternalComponent implements OnInit, OnDestroy {

  constructor(public lang: LangService,
              private lookupService: LookupService,
              private permissionService: PermissionService,
              private employeeService: EmployeeService) {
  }

  private _customRoleTrigger$: Subject<boolean> = new Subject<boolean>();
  private destroy$: Subject<any> = new Subject<any>();

  @Input() user!: ExternalUser;
  @Input() operation!: OperationTypes;
  @Input() readonly: boolean = false;
  @Input() customRolesList: CustomRole[] = [];
  @Input() userUpdateRequest?: ExternalUserUpdateRequest;
  @Input() externalUserPermissions: ExternalUserPermission[] = [];
  @Input() customRoleId?: number;

  @Input() set customRoleChangeTrigger(value: any) {
    this._customRoleTrigger$.next(true);
  }

  @Output() onPermissionChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  chunkSize: number = 3;
  containerInlineStyle: string = 'grid-template-columns: repeat(' + this.chunkSize + ', 1fr);';

  permissionGroups: CheckGroup<Permission>[] = [];
  groupHandler!: CheckGroupHandler<Permission>;

  selectedPermissions: number[] = [];
  oldSelectedPermissions: number[] = [];

  fixedPermissionsList: Permission[] = [];
  fixedPermissionsListIds: number[] = [];
  restrictedUserPermissions: Map<number, boolean> = new Map<number, boolean>();

  internalOnlyGroups:UserPermissionGroupsEnum[]=[
    UserPermissionGroupsEnum.INSPECTION
  ]
  private loggedInSuperAdminOnlyPermissions: string[] = [
    PermissionsEnum.SUB_ADMIN,
    PermissionsEnum.APPROVAL_ADMIN
  ];
  private loggedInInternalUserOnlyPermissions: string[] = [
    PermissionsEnum.SANADI_SEARCH_BENEFICIARY,
    PermissionsEnum.SANADI_SEARCH_BENEFICIARY_BY_NAME
  ];
  private restrictedServicePermissions: string[] = [
    PermissionsEnum.WORLD_CHECK_SEARCH,
    PermissionsEnum.SCREENING_SEARCH_AUDIT
  ];

  ngOnInit(): void {
    this._setDefaultPermissions();
    this._loadPermissions();
    this.listenToCustomRoleTrigger();
  }

  private _emitPermissionChange() {
    this.onPermissionChange.emit(!!this.selectedPermissions.filter(selected => {
      return !this.fixedPermissionsListIds.includes(selected);
    }).length);
  }

  private _setFixedPermissionsList(allPermissions: Permission[]): void {
    this.fixedPermissionsList = [];
    let restrictedPermissions: Permission[] = [];
    // if current logged-in user is external user
    if (this.employeeService.isExternalUser()) {
      // (admin, internal user only visible and super admin only visible) permissions will be restricted
      restrictedPermissions = allPermissions.filter(permission => {
        return permission.groupId === UserPermissionGroupsEnum.ADMINISTRATION
          || (permission.groupId === UserPermissionGroupsEnum.TRAINING_PERMISSIONS
            && permission.permissionKey !== PermissionsEnum.TRAINING_CHARITY_MANAGEMENT)
          || this.loggedInInternalUserOnlyPermissions.includes(permission.permissionKey)
          || this.loggedInSuperAdminOnlyPermissions.includes(permission.permissionKey)
      });
    } else {
      // if not super admin, restrict the super admin only visible permissions
      if (!this.employeeService.userRolesManageUser.isSuperAdmin(this.operation)) {
        restrictedPermissions = allPermissions.filter(permission => {
          return this.loggedInSuperAdminOnlyPermissions.includes(permission.permissionKey);
        });
      }
    }
    this.fixedPermissionsList = this.fixedPermissionsList.concat(restrictedPermissions);
    this.fixedPermissionsListIds = this.fixedPermissionsList.map(x => x.id);
    this._setRestrictedUserPermissions();
  }

  private _setDefaultPermissions(): void {
    this.selectedPermissions = [];
    this.oldSelectedPermissions = [];

    if (this.operation !== OperationTypes.CREATE) {
      if (!!this.userUpdateRequest) {
        (this.userUpdateRequest.newPermissionList ?? []).forEach((permissionId) => {
          this.selectedPermissions.push(permissionId);
        });
        (this.externalUserPermissions ?? []).forEach((item: ExternalUserPermission) => {
          !!item.permissionId && this.oldSelectedPermissions.push(item.permissionId);
        });
      } else {
        (this.externalUserPermissions ?? []).forEach((item: ExternalUserPermission) => {
          if (!!item.permissionId) {
            this.selectedPermissions.push(item.permissionId);
            this.oldSelectedPermissions.push(item.permissionId);
          }
        });
      }
    }
    this.oldSelectedPermissions = [...new Set(this.oldSelectedPermissions)];
    this.selectedPermissions = [...new Set(this.selectedPermissions)];
  }

  private _setRestrictedUserPermissions(): void {
    this.fixedPermissionsList.forEach(restrictedPermission => {
      this.restrictedUserPermissions.set(restrictedPermission.id, this.selectedPermissions.includes(restrictedPermission.id));
    });
  }

  private listenToCustomRoleTrigger() {
    this._customRoleTrigger$
      .pipe(
        takeUntil(this.destroy$),
        delay(100)
      ).subscribe(() => {
      this._setDefaultPermissionsByRole();
    })
  }

  private _setDefaultPermissionsByRole() {
    let selectedRole = this.customRolesList.find(role => role.id === this.customRoleId);
    this.selectedPermissions = !selectedRole ? [] : selectedRole.permissionSet.map(p => p.permissionId);
    this._setRestrictedUserPermissions();
    this.groupHandler.setSelection(this.selectedPermissions);
    this._emitPermissionChange();
  }

  private _loadPermissions(): void {
    this.permissionService.loadAsLookups()
      .pipe(map((result) => {
        return result.filter((permission) => !permission.isInternalPermissionCategory());
      }))
      .pipe(takeUntil(this.destroy$))
      .pipe(tap((allPermissions) => this._setFixedPermissionsList(allPermissions)))
      .pipe(withLatestFrom(of(this.lookupService.listByCategory
        .ExternalUserPermissionGroup.filter(group=> !this.internalOnlyGroups.includes(group.lookupKey) )
      )))
      .pipe(switchMap(([permissions, groups]) => {
        this.buildPermissionGroups(groups, permissions);
        this.groupHandler = new CheckGroupHandler<Permission>(
          this.permissionGroups,
          undefined,
          undefined
        );
        return of(true);
      }))
      .pipe(switchMap(_ => of(this.selectedPermissions)))
      .subscribe((userPermissions) => {
        this.groupHandler.setSelection(userPermissions);
        this._emitPermissionChange();
      });
  }

  private buildPermissionGroups(groups: Lookup[], permissions: Permission[]): void {
    const permissionsByGroup = new Map<number, Permission[]>();
    this.permissionGroups = [];
    permissions
    .filter(permission=> !this.restrictedServicePermissions.includes(permission.permissionKey))
    .reduce((record, permission) => {
      return permissionsByGroup.set(permission.groupId, (permissionsByGroup.get(permission.groupId) || []).concat(permission));
    }, {} as any);
    groups.forEach(group => this.permissionGroups.push(
      new CheckGroup<Permission>(group, permissionsByGroup.get(group.lookupKey) || [], [], this.chunkSize))
    );
  }

  private addToSelection(permission: number): void {
    this.selectedPermissions.push(permission);
  }

  private removeFromSelection(permission: number): void {
    this.selectedPermissions.splice(this.selectedPermissions.indexOf(permission), 1);
  }

  private getOpenGroupPermissions(group: CheckGroup<Permission>): Permission[] {
    return group.list.filter(permission => !this.fixedPermissionsListIds.includes(permission.id));
  }

  private getRestrictedGroupPermissions(group: CheckGroup<Permission>): Permission[] {
    return group.list.filter(permission => this.fixedPermissionsListIds.includes(permission.id));
  }

  private _getSelectedWithoutFixed(group: CheckGroup<Permission>): number[] {
    return group.getSelectedValue().filter(x => !this.fixedPermissionsListIds.includes(x));
  }

  private _getAllWithoutFixed(group: CheckGroup<Permission>): number[] {
    return group.idList.filter(x => !this.fixedPermissionsListIds.includes(x));
  }

  private _setRestrictedPermissionsAgain(group: CheckGroup<Permission>, selectionArray: number[]): void {
    this.getRestrictedGroupPermissions(group).forEach(permission => {
      if (!!this.restrictedUserPermissions.get(permission.id)) {
        selectionArray.push(permission.id);
      }
    });
  }

  private updateSelectedPermissionsByGroup(group: CheckGroup<Permission>, selectedPermissions: number[]): void {
    this.selectedPermissions = this.selectedPermissions.filter(x => !group.idList.includes(x)).concat(selectedPermissions);
  }

  isFixedPermission(permission: Permission): boolean {
    return !!this.fixedPermissionsList.find(restrictedPermission => restrictedPermission.permissionKey === permission.permissionKey);
  }

  isGroupSelectionEmpty(group: CheckGroup<Permission>): boolean {
    return this._getSelectedWithoutFixed(group).length === 0;
  }

  isGroupSelectionIndeterminate(group: CheckGroup<Permission>): boolean {
    return !this.isGroupSelectionEmpty(group)
      && this._getSelectedWithoutFixed(group).length < this._getAllWithoutFixed(group).length;
  }

  isGroupSelectionFull(group: CheckGroup<Permission>): boolean {
    if (this._getAllWithoutFixed(group).length === 0) {
      return false;
    }
    return this._getSelectedWithoutFixed(group).length === this._getAllWithoutFixed(group).length;
  }

  isChangePermissionAllowed(permission: Permission): boolean {
    if (this.readonly) {
      return false;
    }
    return !this.isFixedPermission(permission);
  }

  isGroupVisible(group: CheckGroup<Permission>): boolean {
    return group.list.some(permission => !this.isFixedPermission(permission));
  }

  onGroupClicked(group: CheckGroup<Permission>): void {
    if (this.readonly) {
      return;
    }
    let selection: number[] = [];
    const isSelectAllOperation = this.isGroupSelectionEmpty(group) || this.isGroupSelectionIndeterminate(group);

    if (!isSelectAllOperation) {
      // set restricted permissions to selection if they were already selected
      this._setRestrictedPermissionsAgain(group, selection);
    } else {
      // set all unrestricted permissions to selected
      selection = this.getOpenGroupPermissions(group).map(x => x.id);

      // set restricted permissions to selection if they were already selected
      this._setRestrictedPermissionsAgain(group, selection);
    }
    group.setSelected(selection);
    this.updateSelectedPermissionsByGroup(group, selection);
    this._emitPermissionChange();
  }

  onPermissionClicked($event: Event, permission: Permission, group: CheckGroup<Permission>): void {
    if (!this.isChangePermissionAllowed(permission)) {
      return;
    }
    const checkBox = $event.target as HTMLInputElement;
    checkBox.checked ? group.addToSelection(Number(checkBox.value)) : group.removeFromSelection(Number(checkBox.value));
    checkBox.checked ? this.addToSelection(Number(checkBox.value)) : this.removeFromSelection(Number(checkBox.value));
    this._emitPermissionChange();
  }

  getFinalNewSelectedPermissions() {
    return [...new Set(this.selectedPermissions)] ?? [];
  }

  getFinalOldSelectedPermissions() {
    return [...new Set(this.oldSelectedPermissions)] ?? [];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
