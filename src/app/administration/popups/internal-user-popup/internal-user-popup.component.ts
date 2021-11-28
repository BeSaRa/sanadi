import {Component, Inject, ViewChild} from '@angular/core';
import {LangService} from "@app/services/lang.service";
import {AdminGenericDialog} from "@app/generics/admin-generic-dialog";
import {InternalUser} from "@app/models/internal-user";
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {DIALOG_DATA_TOKEN} from "@app/shared/tokens/tokens";
import {IDialogData} from "@app/interfaces/i-dialog-data";
import {OperationTypes} from '@app/enums/operation-types.enum';
import {DialogRef} from "@app/shared/models/dialog-ref";
import {Observable, of, Subject} from 'rxjs';
import {InternalDepartmentService} from "@app/services/internal-department.service";
import {InternalDepartment} from "@app/models/internal-department";
import {switchMap, takeUntil, withLatestFrom} from "rxjs/operators";
import {Lookup} from "@app/models/lookup";
import {LookupService} from '@app/services/lookup.service';
import {LookupCategories} from '@app/enums/lookup-categories';
import {CheckGroup} from "@app/models/check-group";
import {Permission} from "@app/models/permission";
import {PermissionService} from "@app/services/permission.service";
import {JobTitleService} from "@app/services/job-title.service";
import {JobTitle} from "@app/models/job-title";
import {CheckGroupHandler} from "@app/models/check-group-handler";
import {CustomRole} from "@app/models/custom-role";
import {CustomRoleService} from "@app/services/custom-role.service";
import {UserPermissionService} from "@app/services/user-permission.service";
import {ToastService} from "@app/services/toast.service";
import {SharedService} from "@app/services/shared.service";
import {TabComponent} from "@app/shared/components/tab/tab.component";
import {UserTeamComponent} from "@app/administration/shared/user-team/user-team.component";
import {InternalUserDepartmentService} from "@app/services/internal-user-department.service";
import {InternalUserDepartment} from "@app/models/internal-user-department";
import {AdminResult} from "@app/models/admin-result";

@Component({
  selector: 'internal-user-popup',
  templateUrl: './internal-user-popup.component.html',
  styleUrls: ['./internal-user-popup.component.scss']
})
export class InternalUserPopupComponent extends AdminGenericDialog<InternalUser> {
  operation: OperationTypes;
  model: InternalUser;
  form!: FormGroup;
  departments: InternalDepartment[] = [];
  jobTitles: JobTitle[] = [];
  statusList: Lookup[] = [];
  permissionGroups: CheckGroup<Permission>[] = [];
  groupHandler!: CheckGroupHandler<Permission>;
  customRoles: CustomRole[] = [];
  @ViewChild(UserTeamComponent)
  userTeamComponent!: UserTeamComponent
  displaySaveBtn: boolean = true;
  userDepartments: InternalUserDepartment[] = [];
  displayedColumns: string [] = ['arabicName', 'englishName', 'default', 'actions']
  selectedDepartment: FormControl = new FormControl();
  private userDepartmentsChanged$: Subject<InternalUserDepartment[]> = new Subject<InternalUserDepartment[]>();
  private userDepartmentsIds: number[] = [];

  constructor(public dialogRef: DialogRef,
              public lang: LangService,
              private internalDep: InternalDepartmentService,
              public fb: FormBuilder,
              private sharedService: SharedService,
              private lookupService: LookupService,
              private jobTitleService: JobTitleService,
              private customRoleService: CustomRoleService,
              private userPermissionService: UserPermissionService,
              private internalUserDepartmentService: InternalUserDepartmentService,
              private permissionService: PermissionService,
              private toast: ToastService,
              @Inject(DIALOG_DATA_TOKEN) public data: IDialogData<InternalUser>) {
    super();
    this.model = this.data.model;
    this.operation = this.data.operation;
    this.statusList = lookupService.getByCategory(LookupCategories.COMMON_STATUS);
  }

  private loadJobTitles() {
    this.jobTitleService.load().subscribe((jobTitles) => this.jobTitles = jobTitles)
  }

  private loadDepartments(): void {
    this.internalDep.load()
      .pipe(takeUntil(this.destroy$))
      .subscribe((departments) => {
        this.departments = departments;
      });
  }

  private loadUserDepartments(): void {
    this.internalUserDepartmentService
      .criteria({internalUserId: this.model.id})
      .pipe(takeUntil(this.destroy$))
      .subscribe((list) => {
        this.userDepartmentsChanged$.next(list);
      })
  }

  get basicFormTab() {
    return this.form.get('user');
  }

  get permissionsFormTab() {
    return this.form.get('userPermissions');
  }

  get customRoleId() {
    return this.permissionsFormTab?.get('customRoleId');
  }

  get userCustomRoleId() {
    return this.basicFormTab?.get('customRoleId');
  }

  get userPermissions() {
    return this.permissionsFormTab?.get('permissions');
  }

  private onPermissionChanged(): void {
    this.groupHandler.getSelection().length ? this.updateUserPermissions(true) : this.updateUserPermissions(false);
  }

  private loadPermissions() {
    this.permissionService
      .load()
      .pipe(takeUntil(this.destroy$))
      .pipe(withLatestFrom(of(this.lookupService.getByCategory(LookupCategories.ORG_USER_PERMISSION_GROUP))))
      .pipe(switchMap(([permissions, groups]) => {
        this.buildPermissionGroups(groups, permissions);
        this.groupHandler = new CheckGroupHandler<Permission>(
          this.permissionGroups,
          () => this.onPermissionChanged(),
          () => this.onPermissionChanged()
        );
        return of(true);
      }))
      .pipe(switchMap(_ => this.model.id ? this.userPermissionService.loadUserPermissions(this.model.id) : of([])))
      .subscribe((userPermissions) => {
        this.groupHandler.setSelection(userPermissions.map(p => p.permissionId));
        this.onPermissionChanged();
      })

  }

  private buildPermissionGroups(groups: Lookup[], permissions: Permission[]): void {
    const permissionsByGroup = new Map<number, Permission[]>();
    this.permissionGroups = [];
    permissions.reduce((record, permission) => {
      return permissionsByGroup.set(permission.groupId, (permissionsByGroup.get(permission.groupId) || []).concat(permission));
    }, {} as any);
    groups.forEach(group => this.permissionGroups.push(new CheckGroup(group, permissionsByGroup.get(group.lookupKey) || [], [])));
  }

  private loadCustomRoles() {
    this.customRoleService
      .loadComposite()
      .pipe(takeUntil(this.destroy$))
      .subscribe((roles) => this.customRoles = roles);
  }

  initPopup(): void {
    this.loadDepartments();
    this.loadJobTitles();
    this.loadPermissions();
    this.loadCustomRoles();
    this.loadUserDepartments();
    this.listenToUserDepartmentsChange();
  }

  destroyPopup(): void {

  }

  buildForm(): void {
    this.form = this.fb.group({
      user: this.fb.group(this.model.buildForm(true)),
      userPermissions: this.fb.group({
        permissions: [false, Validators.requiredTrue],
        customRoleId: [this.model?.customRoleId, Validators.required]
      })
    });
    this.preventUserDomain();
  }

  get domainName(): AbstractControl {
    return this.form.get('user.domainName') as AbstractControl;
  }

  preventUserDomain(): void {
    if (this.operation === OperationTypes.UPDATE) {
      this.domainName.disable();
    } else {
      this.domainName.enable();
    }
  }

  afterSave(model: InternalUser, dialogRef: DialogRef): void {
    this.userPermissionService
      .saveUserPermissions(model.id, this.groupHandler.getSelection())
      .subscribe(() => {
        const message = (this.operation === OperationTypes.CREATE)
          ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
        this.toast.success(message.change({x: model.getName()}));
        // here i closing the popup after click on save and the operation is update
        this.operation === OperationTypes.UPDATE && dialogRef.close(model);
        // here i change operation to UPDATE after first save
        this.operation === OperationTypes.CREATE && (this.operation = OperationTypes.UPDATE);
        this.preventUserDomain();
      });
  }

  beforeSave(model: InternalUser, form: FormGroup): boolean | Observable<boolean> {
    return form.valid;
  }

  prepareModel(model: InternalUser, form: FormGroup): InternalUser | Observable<InternalUser> {
    return (new InternalUser()).clone({...model, ...form.get('user')?.value});
  }

  saveFail(error: Error): void {
    console.log(error);
  }

  basicInfoHasError() {
    return (this.basicFormTab!.invalid && (this.basicFormTab!.touched || this.basicFormTab!.dirty));
  }

  permissionTabHasError() {
    return (this.permissionsFormTab!.invalid && (this.permissionsFormTab!.touched || this.permissionsFormTab!.dirty));
  }

  updateUserPermissions(bool: boolean): void {
    this.userPermissions?.setValue(bool);
    this.userPermissions?.markAsDirty();
  }

  onCustomRoleChange() {
    let selectedRole = this.customRoles.find(role => role.id === this.customRoleId!.value);
    this.userCustomRoleId?.setValue(selectedRole ? selectedRole.id : null);
    this.groupHandler.setSelection(selectedRole ? selectedRole.permissionSet.map(p => p.permissionId) : [])
    this.updateUserPermissions(!!this.groupHandler.selection.length)
  }

  onTabChange($event: TabComponent) {
    this.displaySaveBtn = (!['services', 'teams'].includes($event.name))
  }

  addDepartment() {
    if (!this.selectedDepartment.value) {
      return;
    }
    const dep = this.selectedDepartment.value as InternalDepartment;
    if (this.isDepExists(dep)) {
      return;
    }
    (new InternalUserDepartment())
      .clone({
        internalUserId: this.model.id,
        internalDepartmentId: dep.id
      })
      .save()
      .subscribe((model) => {
        this.toast.success(this.lang.map.msg_create_x_success.change({x: dep.getName()}))
        this.userDepartments = this.userDepartments.concat([model.clone({
          id: model.id,
          departmentInfo: AdminResult.createInstance({
            id: dep.id,
            arName: dep.arName,
            enName: dep.enName,
          })
        })])
        this.selectedDepartment.patchValue(null);

        if (this.userDepartments.length === 1) {
          this.toggleDefaultDepartment(this.userDepartments[0], undefined, true);
        }
      })
  }

  deleteDepartment(userDep: InternalUserDepartment) {
    if (this.canNotDeleteDepartment(userDep)) {
      return;
    }
    userDep.delete()
      .subscribe(() => {
        this.toast.success(this.lang.map.msg_delete_x_success.change({x: userDep.departmentInfo.getName()}))
        this.userDepartments = this.userDepartments.filter(item => item.id !== userDep.id);
      })
  }

  canNotDeleteDepartment(userDep: InternalUserDepartment): boolean {
    return userDep.internalDepartmentId === this.model.defaultDepartmentId;
  }

  canNotToggleItOff(row: InternalUserDepartment): boolean {
    return this.model.defaultDepartmentId === row.internalDepartmentId;
  }

  toggleDefaultDepartment(row: InternalUserDepartment, input?: HTMLInputElement, mute: boolean = false) {
    if (this.canNotToggleItOff(row)) {
      input && (input.checked = true);
      return;
    }
    this.model.defaultDepartmentId = row.internalDepartmentId;
    this.model.save().subscribe(() => {
      !mute ? this.toast.success(this.lang.map.msg_update_success) : null;
    })
  }

  isDepExists(dep: InternalDepartment): boolean {
    return this.userDepartmentsIds.includes(dep.id);
  }

  private listenToUserDepartmentsChange() {
    this.userDepartmentsChanged$
      .subscribe((list) => {
        this.userDepartmentsIds = list.map(item => item.internalDepartmentId);
        this.userDepartments = list;
      })
  }
}
