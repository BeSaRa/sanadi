import { Component, Inject, ViewChild } from '@angular/core';
import { LangService } from "@app/services/lang.service";
import { AdminGenericDialog } from "@app/generics/admin-generic-dialog";
import { InternalUser } from "@app/models/internal-user";
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DIALOG_DATA_TOKEN } from "@app/shared/tokens/tokens";
import { IDialogData } from "@app/interfaces/i-dialog-data";
import { OperationTypes } from '@app/enums/operation-types.enum';
import { DialogRef } from "@app/shared/models/dialog-ref";
import { Observable, of, Subject } from 'rxjs';
import { InternalDepartmentService } from "@app/services/internal-department.service";
import { InternalDepartment } from "@app/models/internal-department";
import { switchMap, takeUntil, withLatestFrom } from "rxjs/operators";
import { Lookup } from "@app/models/lookup";
import { LookupService } from '@app/services/lookup.service';
import { CheckGroup } from "@app/models/check-group";
import { Permission } from "@app/models/permission";
import { PermissionService } from "@app/services/permission.service";
import { CheckGroupHandler } from "@app/models/check-group-handler";
import { CustomRole } from "@app/models/custom-role";
import { CustomRoleService } from "@app/services/custom-role.service";
import { UserPermissionService } from "@app/services/user-permission.service";
import { ToastService } from "@app/services/toast.service";
import { SharedService } from "@app/services/shared.service";
import { TabComponent } from "@app/shared/components/tab/tab.component";
import { UserTeamComponent } from "@app/administration/shared/user-team/user-team.component";
import { InternalUserDepartmentService } from "@app/services/internal-user-department.service";
import { InternalUserDepartment } from "@app/models/internal-user-department";
import { AdminResult } from "@app/models/admin-result";
import { IKeyValue } from '@app/interfaces/i-key-value';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { FileExtensionsEnum } from '@app/enums/file-extension-mime-types-icons.enum';
import { InternalUserService } from '@app/services/internal-user.service';
import { BlobModel } from '@app/models/blob-model';
import { CommonUtils } from '@app/helpers/common-utils';

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
  commonStatusEnum = CommonStatusEnum;
  fileExtensionsEnum = FileExtensionsEnum;
  signatureFile?: File;
  loadedSignature?: BlobModel;
  list: InternalUser[] = [];

  tabsData: IKeyValue = {
    basic: { name: 'basic' },
    permissions: { name: 'permissions' },
    departments: { name: 'departments' },
    teams: { name: 'teams' },
    services: { name: 'services' },
    followup: { name: 'followup' }
  };

  constructor(public dialogRef: DialogRef,
              public lang: LangService,
              private internalDep: InternalDepartmentService,
              public fb: FormBuilder,
              private sharedService: SharedService,
              private lookupService: LookupService,
              private customRoleService: CustomRoleService,
              private userPermissionService: UserPermissionService,
              private internalUserDepartmentService: InternalUserDepartmentService,
              private permissionService: PermissionService,
              private toast: ToastService,
              private internalUserService: InternalUserService,
              @Inject(DIALOG_DATA_TOKEN) public data: IDialogData<InternalUser>) {
    super();
    this.model = this.data.model;
    this.operation = this.data.operation;
    this.list = this.data.list;
    this.statusList = lookupService.listByCategory.CommonStatus;
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
      .criteria({ internalUserId: this.model.id })
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
      .pipe(withLatestFrom(of(this.lookupService.listByCategory.OrgUserPermissionGroup)))
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

  private loadSignature() {
    this.internalUserService.loadSignatureByGeneralUserId(this.model.generalUserId)
      .subscribe((result) => {
        if (result.blob.size === 0) {
          this.loadedSignature = undefined;
          return;
        }
        this.loadedSignature = result;
      });
  }

  initPopup(): void {
    this.loadDepartments();
    this.loadPermissions();
    this.loadCustomRoles();
    if (this.operation === OperationTypes.UPDATE) {
      this.loadUserDepartments();
      this.loadSignature();
    }
    this.listenToUserDepartmentsChange();
  }

  destroyPopup(): void {

  }

  buildForm(): void {
    this.form = this.fb.group({
      user: this.fb.group(this.model.buildForm(true)),
      userPermissions: this.fb.group({
        permissions: [false],
        customRoleId: [this.model?.customRoleId]
      })
    });
    this.preventUserDomain();
    if (this.operation === OperationTypes.UPDATE) {
      this._updatePermissionValidations(true);
    }
  }

  private _updatePermissionValidations(forceUpdateValueAndValidation: boolean = false) {
    const value = this.customRoleId?.value;
    if (!value) {
      (this.userPermissions as FormControl).removeValidators(Validators.requiredTrue);
    } else {
      (this.userPermissions as FormControl).addValidators(Validators.requiredTrue);
    }
    if (forceUpdateValueAndValidation) {
      (this.userPermissions as FormControl).updateValueAndValidity();
    }
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
    let signSub;
    if (!!this.signatureFile) {
      signSub = model.saveSignature(this.signatureFile);
    } else {
      signSub = of(true);
    }

    signSub.subscribe(() => {
      this.userPermissionService
        .saveUserPermissions(model.id, this.groupHandler.getSelection())
        .subscribe(() => {
          const message = (this.operation === OperationTypes.CREATE)
            ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
          this.toast.success(message.change({ x: model.getName() }));
          // here i closing the popup after click on save and the operation is update
          this.operation === OperationTypes.UPDATE && dialogRef.close(model);
          // here i change operation to UPDATE after first save
          this.operation === OperationTypes.CREATE && (this.operation = OperationTypes.UPDATE);
          this.preventUserDomain();
        });
    })
  }

  beforeSave(model: InternalUser, form: FormGroup): boolean | Observable<boolean> {
    if (!form.valid) {
      this.toast.info(this.lang.map.msg_all_required_fields_are_filled);
      return false;
    }

    let user = (new InternalUser()).clone({ ...model, ...form.get('user')?.value });
    if (!this.isDuplicatedUser(user)) {
      return form.valid;
    }
    return false;
  }

  prepareModel(model: InternalUser, form: FormGroup): InternalUser | Observable<InternalUser> {
    return (new InternalUser()).clone({ ...model, ...form.get('user')?.value });
  }

  isDuplicatedUser(internalUser: InternalUser) {
    let isDuplicatedUserLoginName = false;
    let isDuplicatedUserEmpNumber = false;
    let isDuplicatedUserPhoneNumber = false;
    let isDuplicatedUserEmail = false;
    if (this.isDuplicatedUserLoginName(internalUser)) {
      this.toast.error(this.lang.map.login_name_is_duplicated);
      isDuplicatedUserLoginName = true;
    }

    if (this.isDuplicatedUserEmpNumber(internalUser)) {
      this.toast.error(this.lang.map.employee_code_is_duplicated);
      isDuplicatedUserEmpNumber = true;
    }

    if (this.isDuplicatedUserPhoneNumber(internalUser)) {
      this.toast.error(this.lang.map.phone_number_is_duplicated);
      isDuplicatedUserPhoneNumber = true;
    }

    if (this.isDuplicatedUserEmail(internalUser)) {
      this.toast.error(this.lang.map.email_is_duplicated);
      isDuplicatedUserEmail = true;
    }
    return isDuplicatedUserLoginName || isDuplicatedUserEmpNumber || isDuplicatedUserPhoneNumber || isDuplicatedUserEmail;
  }

  isDuplicatedUserLoginName(internalUser: InternalUser) {
    return this.list
      .filter(user => user.id != internalUser.id)
      .some(user => user.domainName == internalUser.domainName);
  }

  isDuplicatedUserEmpNumber(internalUser: InternalUser) {
    return this.list
      .filter(user => user.id != internalUser.id)
      .some(user => user.empNum == internalUser.empNum);
  }

  isDuplicatedUserPhoneNumber(internalUser: InternalUser) {
    return this.list
      .filter(user => user.id != internalUser.id)
      .some(user => user.phoneNumber == internalUser.phoneNumber);
  }

  isDuplicatedUserEmail(internalUser: InternalUser) {
    return this.list
      .filter(user => user.id != internalUser.id)
      .some(user => user.email == internalUser.email);
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
    this.groupHandler.setSelection(selectedRole ? selectedRole.permissionSet.map(p => p.permissionId) : []);
    this.updateUserPermissions(!!this.groupHandler.selection.length);
    this._updatePermissionValidations(true);
  }

  onTabChange($event: TabComponent) {
    this.displaySaveBtn = (![this.tabsData.services.name, this.tabsData.teams.name, this.tabsData.departments.name].includes($event.name));
    this.validateFieldsVisible = (![this.tabsData.services.name, this.tabsData.teams.name, this.tabsData.departments.name].includes($event.name));
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
        this.toast.success(this.lang.map.msg_create_x_success.change({ x: dep.getName() }))
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
        this.toast.success(this.lang.map.msg_delete_x_success.change({ x: userDep.departmentInfo.getName() }))
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
    this.model.updateDefaultDepartment().subscribe(() => {
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

  setSignatureFile(file: File | File[] | undefined): void {
    if (!file || file instanceof File) {
      this.signatureFile = file;
    } else {
      this.signatureFile = file[0];
    }
  }

  printPermissions($event: MouseEvent): void {
    $event?.preventDefault();
    this.userPermissionService.loadPermissionsAsBlob(this.model.id)
      .subscribe((data) => {
        CommonUtils.printBlobData(data, 'InternalUserPermission_' + this.model.getName());
      });
  }
}
