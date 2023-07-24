import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {InternalUser} from '@app/models/internal-user';
import {AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {Observable, of, Subject} from 'rxjs';
import {InternalDepartmentService} from '@app/services/internal-department.service';
import {InternalDepartment} from '@app/models/internal-department';
import {catchError, filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {Lookup} from '@app/models/lookup';
import {LookupService} from '@app/services/lookup.service';
import {CustomRole} from '@app/models/custom-role';
import {ExternalUserCustomRoleService} from '@services/external-user-custom-role.service';
import {UserPermissionService} from '@app/services/user-permission.service';
import {ToastService} from '@app/services/toast.service';
import {SharedService} from '@app/services/shared.service';
import {TabComponent} from '@app/shared/components/tab/tab.component';
import {UserTeamComponent} from '@app/administration/shared/user-team/user-team.component';
import {InternalUserDepartmentService} from '@app/services/internal-user-department.service';
import {InternalUserDepartment} from '@app/models/internal-user-department';
import {AdminResult} from '@app/models/admin-result';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {FileExtensionsEnum} from '@app/enums/file-extension-mime-types-icons.enum';
import {InternalUserService} from '@app/services/internal-user.service';
import {BlobModel} from '@app/models/blob-model';
import {CommonUtils} from '@app/helpers/common-utils';
import {TabMap} from '@app/types/types';
import {
  CustomMenuPermissionComponent
} from '@app/administration/shared/custom-menu-permission/custom-menu-permission.component';
import {EmployeeService} from '@services/employee.service';
import {AuthService} from '@services/auth.service';
import {
  UserFollowupPermissionNewComponent
} from '@app/administration/shared/user-followup-permission-new/user-followup-permission-new.component';
import {
  UserPermissionInternalComponent
} from "@app/administration/shared/user-permission-internal/user-permission-internal.component";

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'internal-user-popup',
  templateUrl: './internal-user-popup.component.html',
  styleUrls: ['./internal-user-popup.component.scss']
})
export class InternalUserPopupComponent extends AdminGenericDialog<InternalUser> implements AfterViewInit {
  operation: OperationTypes;
  model: InternalUser;
  form!: UntypedFormGroup;
  departments: InternalDepartment[] = [];
  customRoles: CustomRole[] = [];
  @ViewChild(UserTeamComponent) userTeamComponent!: UserTeamComponent;
  @ViewChild('customMenuPermissionComponent') customMenuPermissionComponentRef!: CustomMenuPermissionComponent;
  displaySaveBtn: boolean = true;
  userDepartments: InternalUserDepartment[] = [];

  get displayedColumns(): string [] {
    return this.readonly ? ['arabicName', 'englishName', 'default'] : ['arabicName', 'englishName', 'default', 'actions'];
  }

  selectedDepartment: UntypedFormControl = new UntypedFormControl();
  private userDepartmentsChanged$: Subject<InternalUserDepartment[]> = new Subject<InternalUserDepartment[]>();
  private userDepartmentsIds: number[] = [];
  fileExtensionsEnum = FileExtensionsEnum;
  signatureFile?: File;
  loadedSignature?: BlobModel;
  list: InternalUser[] = [];
  customRoleChangedTrigger: boolean = false;

  tabsData: TabMap = {
    basic: {
      name: 'basic',
      langKey: 'lbl_basic_info',
      index: 0,
      // checkTouchedDirty: true,
      validStatus: () => {
        if (!this.basicFormTab || this.readonly) {
          return true;
        }
        return this.basicFormTab.valid;
      },
      isTouchedOrDirty: () => {
        if (!this.basicFormTab) {
          return true;
        }
        return this.basicFormTab!.touched || this.basicFormTab!.dirty;
      }
    },
    permissions: {
      name: 'permissions',
      langKey: 'lbl_permissions',
      index: 1,
      // checkTouchedDirty: true,
      validStatus: () => {
        if (!this.permissionsFormTab || this.readonly) {
          return true;
        }
        return this.permissionsFormTab.valid;
      },
      isTouchedOrDirty: () => {
        if (!this.permissionsFormTab) {
          return true;
        }
        return this.permissionsFormTab.touched || this.permissionsFormTab.dirty;
      }
    },
    menus: {name: 'menus', langKey: 'menus', index: 2, validStatus: () => true, isTouchedOrDirty: () => true},
    departments: {
      name: 'departments',
      langKey: 'departments',
      index: 3,
      validStatus: () => true,
      isTouchedOrDirty: () => true
    },
    teams: {name: 'teams', langKey: 'link_teams', index: 4, validStatus: () => true, isTouchedOrDirty: () => true},
    subTeams: {
      name: 'sub-teams',
      langKey: 'link_sub_teams',
      index: 5,
      validStatus: () => true,
      isTouchedOrDirty: () => true
    },
    followup: {name: 'followup', langKey: 'followup', index: 6, validStatus: () => true, isTouchedOrDirty: () => true},
    services: {
      name: 'services',
      langKey: 'link_services',
      index: 7,
      validStatus: () => true,
      isTouchedOrDirty: () => true
    },
  };
  @ViewChild('dialogContent') dialogContent!: ElementRef;
  @ViewChild(UserPermissionInternalComponent) userPermissionInternalComponentRef!: UserPermissionInternalComponent;
  @ViewChild('userFollowupPermissionComponent') userFollowupPermissionComponentRef!: UserFollowupPermissionNewComponent;

  constructor(public dialogRef: DialogRef,
              public lang: LangService,
              private internalDep: InternalDepartmentService,
              private employeeService: EmployeeService,
              private authService: AuthService,
              public fb: UntypedFormBuilder,
              private cd: ChangeDetectorRef,
              private customRoleService: ExternalUserCustomRoleService,
              private userPermissionService: UserPermissionService,
              private internalUserDepartmentService: InternalUserDepartmentService,
              private toast: ToastService,
              private internalUserService: InternalUserService,
              @Inject(DIALOG_DATA_TOKEN) public data: IDialogData<InternalUser>) {
    super();
    this.model = this.data.model;
    this.operation = this.data.operation;
  }

  initPopup(): void {
    this.loadDepartments();
    this.loadCustomRoles();
    if (this.operation === OperationTypes.UPDATE) {
      this.loadUserDepartments();
      this.loadSignature();
    }
    this.listenToUserDepartmentsChange();
  }

  private _afterViewInit(): void {
    if (this.operation === OperationTypes.UPDATE) {
      this._updatePermissionValidations(true);
      this.displayFormValidity(this.form, this.dialogContent.nativeElement);
    }
    if (this.readonly) {
      this.form.disable();
      this.displaySaveBtn = false;
      this.validateFieldsVisible = false;
    }
  }

  ngAfterViewInit(): void {
    // used the private function to reuse functionality of afterViewInit if needed
    this._afterViewInit();
    this.cd.detectChanges();
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
  }

  private loadDepartments(): void {
    this.internalDep.loadAsLookups()
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
      });
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

  private loadCustomRoles() {
    this.customRoleService.loadAsLookups()
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

  get readonly(): boolean {
    return this.operation === OperationTypes.VIEW;
  }

  get popupTitle(): string {
    if (this.operation === OperationTypes.CREATE) {
      return this.lang.map.add_new_internal_user;
    } else if (this.operation === OperationTypes.UPDATE) {
      return this.lang.map.edit_internal_user + ' : ' + this.model.getName();
    } else if (this.operation === OperationTypes.VIEW) {
      return this.lang.map.view + ' : ' + this.model.getName();
    }
    return '';
  }

  private _updatePermissionValidations(forceUpdateValueAndValidation: boolean = false) {
    const value = this.customRoleId?.value;
    if (!value) {
      (this.userPermissions as UntypedFormControl).removeValidators(Validators.requiredTrue);
    } else {
      (this.userPermissions as UntypedFormControl).addValidators(Validators.requiredTrue);
    }
    if (forceUpdateValueAndValidation) {
      (this.userPermissions as UntypedFormControl).updateValueAndValidity();
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
    this.model = model;
    let signSub;
    if (!!this.signatureFile) {
      signSub = model.saveSignature(this.signatureFile);
    } else {
      signSub = of(true);
    }

    signSub.subscribe(() => {
      this.userPermissionInternalComponentRef.saveUserPermissions()
        .pipe(
          catchError(() => of(null)),
          filter((response) => response !== null)
        )
        .pipe(
          switchMap(() => this.customMenuPermissionComponentRef.saveUserCustomMenuPermissions()),
          catchError(() => of(null)),
          filter((response) => response !== null)
        )
        .pipe(
          switchMap(() => {
            return this.employeeService.isCurrentUser(model) ? this.authService.validateToken()
              .pipe(catchError(() => of(model)), map(_ => model)) : of(model);
          })
        )
        .subscribe(() => {
          const message = (this.operation === OperationTypes.CREATE)
            ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
          this.toast.success(message.change({x: model.getName()}));
          // here I'm closing the popup after click on save and the operation is updating
          this.operation === OperationTypes.UPDATE && dialogRef.close(model);
          // here I change operation to UPDATE after first save
          this.operation === OperationTypes.CREATE && (this.operation = OperationTypes.UPDATE);
          this.preventUserDomain();
        });
    });
  }

  beforeSave(model: InternalUser, form: UntypedFormGroup): boolean | Observable<boolean> {
    if (!form.valid) {
      this.toast.info(this.lang.map.msg_all_required_fields_are_filled);
      return false;
    }
    return true;
  }

  prepareModel(model: InternalUser, form: UntypedFormGroup): InternalUser | Observable<InternalUser> {
    return (new InternalUser()).clone({...model, ...form.get('user')?.value});
  }

  saveFail(error: Error): void {
    console.log(error);
  }

  updateUserPermissions(bool: boolean): void {
    this.userPermissions?.setValue(bool);
    this.userPermissions?.markAsDirty();
  }

  onCustomRoleChange(value: any, userInteraction: boolean = false) {
    if (this.readonly) {
      return;
    }
    let selectedRole = this.customRoles.find(role => role.id === value);
    this.userCustomRoleId?.setValue(selectedRole ? selectedRole.id : null);
    this._updatePermissionValidations(true);
    if (userInteraction) {
      this.customRoleChangedTrigger = !this.customRoleChangedTrigger;
    }
  }

  onTabChange($event: TabComponent) {
    const tabsWithSaveAndValidate = [this.tabsData.basic.name, this.tabsData.permissions.name, this.tabsData.menus.name];
    this.displaySaveBtn = tabsWithSaveAndValidate.includes($event.name);
    this.validateFieldsVisible = tabsWithSaveAndValidate.includes($event.name);
    if ($event.name === this.tabsData.followup.name && !!this.model.id) {
      if (!this.tabsData.followup.isLoaded) {
        this.userFollowupPermissionComponentRef.reloadUserFollowupPermissions();
        this.tabsData.followup.isLoaded = true;
      }
    }
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
        this.toast.success(this.lang.map.msg_create_x_success.change({x: dep.getName()}));
        this.userDepartments = this.userDepartments.concat([model.clone({
          id: model.id,
          departmentInfo: AdminResult.createInstance({
            id: dep.id,
            arName: dep.arName,
            enName: dep.enName,
          })
        })]);
        this.userDepartmentsIds.push(dep.id);
        this.selectedDepartment.patchValue(null);

        if (this.userDepartments.length === 1) {
          this.toggleDefaultDepartment(this.userDepartments[0], undefined, true);
        }
      });
  }

  deleteDepartment(userDep: InternalUserDepartment) {
    if (this.canNotDeleteDepartment(userDep)) {
      return;
    }
    userDep.delete()
      .subscribe(() => {
        this.toast.success(this.lang.map.msg_delete_x_success.change({x: userDep.departmentInfo.getName()}));
        this.userDepartments = this.userDepartments.filter(item => item.id !== userDep.id);
        this.userDepartmentsIds = this.userDepartmentsIds.filter(item => item != userDep.internalDepartmentId);
      });
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
    });
  }

  isDepExists(dep: InternalDepartment): boolean {
    return this.userDepartmentsIds.includes(dep.id);
  }

  private listenToUserDepartmentsChange() {
    this.userDepartmentsChanged$
      .subscribe((list) => {
        this.userDepartmentsIds = list.map(item => item.internalDepartmentId);
        this.userDepartments = list;
      });
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

  getTabInvalidStatus(tabName: string): boolean {
    let tab = this.tabsData[tabName];
    if (!tab) {
      console.info('tab not found: %s', tabName);
      return true; // if tab not found, consider it invalid
    }
    if (!tab.checkTouchedDirty) {
      return !tab.validStatus();
    }
    return !tab.validStatus() && tab.isTouchedOrDirty();
  }

  destroyPopup(): void {

  }
}
