import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Observable, of, Subject} from "rxjs";
import {InternalUser} from "@models/internal-user";
import {LangService} from "@services/lang.service";
import {LookupService} from "@services/lookup.service";
import {CheckGroup} from "@models/check-group";
import {CheckGroupHandler} from "@models/check-group-handler";
import {Permission} from "@models/permission";
import {CommonUtils} from "@helpers/common-utils";
import {UserPermissionService} from "@services/user-permission.service";
import {delay, map, switchMap, takeUntil, withLatestFrom} from "rxjs/operators";
import {PermissionService} from "@services/permission.service";
import {Lookup} from "@models/lookup";
import {CustomRole} from "@models/custom-role";

@Component({
  selector: 'user-permission-internal',
  templateUrl: './user-permission-internal.component.html',
  styleUrls: ['./user-permission-internal.component.scss']
})
export class UserPermissionInternalComponent implements OnInit, OnDestroy {

  constructor(public lang: LangService,
              private lookupService: LookupService,
              private permissionService: PermissionService,
              private userPermissionService: UserPermissionService) {
  }

  private _customRoleTrigger$: Subject<boolean> = new Subject<boolean>();
  private destroy$: Subject<any> = new Subject<any>();

  @Input() user!: InternalUser;
  @Input() readonly: boolean = false;
  @Input() customRolesList: CustomRole[] = [];
  @Input() customRoleId?: number;

  @Input() set customRoleChangeTrigger(value: any) {
    this._customRoleTrigger$.next(true);
  }

  @Output() onPermissionChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  chunkSize: number = 3;
  permissionGroups: CheckGroup<Permission>[] = [];
  groupHandler!: CheckGroupHandler<Permission>;

  ngOnInit(): void {
    this._loadPermissions();
    this.listenToCustomRoleTrigger();
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
    this.groupHandler.setSelection(selectedRole ? selectedRole.permissionSet.map(p => p.permissionId) : []);
    this._emitPermissionChange();

  }

  private _loadPermissions(): void {
    this.permissionService.loadAsLookups()
      .pipe(map((result) => {
        return result.filter((permission) => !permission.isExternalPermissionCategory());
      }))
      .pipe(takeUntil(this.destroy$))
      .pipe(withLatestFrom(of(this.lookupService.listByCategory.ExternalUserPermissionGroup)))
      .pipe(switchMap(([permissions, groups]) => {
        this.buildPermissionGroups(groups, permissions);
        this.groupHandler = new CheckGroupHandler<Permission>(
          this.permissionGroups,
          () => this._emitPermissionChange(),
          () => this._emitPermissionChange()
        );
        return of(true);
      }))
      .pipe(switchMap(_ => this.user.id ? this.userPermissionService.loadUserPermissions(this.user.id) : of([])))
      .subscribe((userPermissions) => {
        this.groupHandler.setSelection(userPermissions.map(p => p.permissionId));
        this._emitPermissionChange();
      });
  }

  private buildPermissionGroups(groups: Lookup[], permissions: Permission[]): void {
    const permissionsByGroup = new Map<number, Permission[]>();
    this.permissionGroups = [];
    permissions.reduce((record, permission) => {
      return permissionsByGroup.set(permission.groupId, (permissionsByGroup.get(permission.groupId) || []).concat(permission));
    }, {} as any);
    groups.forEach(group => this.permissionGroups.push(
      new CheckGroup<Permission>(group, permissionsByGroup.get(group.lookupKey) || [], [], this.chunkSize))
    );
  }

  private _emitPermissionChange() {
    this.onPermissionChange.emit(!!this.groupHandler.getSelection().length);
  }

  private _getFinalPermissions() {
    return [...new Set(this.groupHandler.getSelection())];
  }

  saveUserPermissions(): Observable<any> {
    const selection: number[] = this._getFinalPermissions();
    return this.userPermissionService.saveUserPermissions(this.user.id, selection);
  }

  printPermissions($event: MouseEvent): void {
    $event?.preventDefault();
    this.userPermissionService.loadPermissionsAsBlob(this.user.id)
      .subscribe((data) => {
        CommonUtils.printBlobData(data, 'InternalUserPermission_' + this.user.getName());
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
