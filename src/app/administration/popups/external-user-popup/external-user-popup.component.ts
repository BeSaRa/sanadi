import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {LangService} from '@app/services/lang.service';
import {ExternalUser} from '@app/models/external-user';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {ToastService} from '@app/services/toast.service';
import {Lookup} from '@app/models/lookup';
import {LookupService} from '@app/services/lookup.service';
import {CustomRole} from '@app/models/custom-role';
import {isObservable, Observable, of} from 'rxjs';
import {catchError, exhaustMap, filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {ExternalUserPermission} from '@app/models/external-user-permission';
import {EmployeeService} from '@app/services/employee.service';
import {AuthService} from '@app/services/auth.service';
import {Profile} from '@app/models/profile';
import {ProfileService} from '@services/profile.service';
import {CommonUtils} from '@helpers/common-utils';
import {TabMap} from '@app/types/types';
import {DialogService} from '@services/dialog.service';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {
  CustomMenuPermissionComponent
} from '@app/administration/shared/custom-menu-permission/custom-menu-permission.component';
import {BaseModel} from '@app/models/base-model';
import {ExternalUserUpdateRequest} from '@app/models/external-user-update-request';
import {ExternalUserUpdateRequestService} from '@services/external-user-update-request.service';
import {ExternalUserUpdateRequestStatusEnum} from '@app/enums/external-user-update-request-status.enum';
import {ExternalUserUpdateRequestTypeEnum} from '@app/enums/external-user-update-request-type.enum';
import {
  UserSecurityExternalComponent
} from '@app/administration/shared/user-security-external/user-security-external.component';
import {
  UserPermissionExternalComponent
} from "@app/administration/shared/user-permission-external/user-permission-external.component";

@Component({
  selector: 'app-external-user-popup',
  templateUrl: './external-user-popup.component.html',
  styleUrls: ['./external-user-popup.component.scss']
})
export class ExternalUserPopupComponent extends AdminGenericDialog<ExternalUser> implements AfterViewInit {
  list: ExternalUser[] = [];
  form!: UntypedFormGroup;
  model: ExternalUser;
  operation: OperationTypes;
  profileList: Profile[] = [];
  customRoleList: CustomRole[];
  externalUserPermissions: ExternalUserPermission[];
  userUpdateRequest: ExternalUserUpdateRequest;

  tabsData: TabMap = {
    basic: {
      name: 'basic',
      index: 0,
      langKey: 'lbl_basic_info',
      validStatus: () => {
        if (this.form.disabled || !this.basicFormGroup) {
          return true;
        }
        return this.basicFormGroup.valid;
      },
      isTouchedOrDirty: () => true
    },
    permissions: {
      name: 'permissions',
      index: 1,
      langKey: 'lbl_permissions',
      validStatus: () => {
        if (this.form.disabled || !this.permissionsFormGroup) {
          return true;
        }
        return this.permissionsFormGroup.valid;
      },
      isTouchedOrDirty: () => true
    },
    menus: {name: 'menus', langKey: 'menus', index: 2, validStatus: () => true, isTouchedOrDirty: () => true},
    services: {
      name: 'services',
      index: 3,
      langKey: 'link_services',
      validStatus: () => true,
      isTouchedOrDirty: () => true
    },

  };
  validateFieldsVisible = true;
  saveVisible: boolean = true;
  canSaveDirectly!: boolean;
  customRoleChangedTrigger: boolean = false;
  requestSaveType: 'SAVE_REQUEST' | 'SAVE_USER' | undefined = undefined;
  itemInSaveOperation?: ExternalUserUpdateRequest;

  constructor(public dialogRef: DialogRef,
              @Inject(DIALOG_DATA_TOKEN) data: IDialogData<ExternalUser>,
              private toast: ToastService,
              public langService: LangService,
              private lookupService: LookupService,
              public employeeService: EmployeeService,
              private externalUserUpdateRequestService: ExternalUserUpdateRequestService,
              private authService: AuthService,
              private profileService: ProfileService,
              private dialogService: DialogService,
              private cd: ChangeDetectorRef,
              public fb: UntypedFormBuilder) {
    super();
    this.model = data.model;
    this.operation = data.operation;
    this.customRoleList = data.customRoleList;
    this.externalUserPermissions = data.externalUserPermissions;
    this.userUpdateRequest = data.userRequest;
    this.canSaveDirectly = this.externalUserUpdateRequestService.canSaveDirectly(this.operation);
    this.requestSaveType = !!this.userUpdateRequest ? 'SAVE_REQUEST' : (this.canSaveDirectly ? 'SAVE_USER' : 'SAVE_REQUEST');
  }

  @ViewChild('dialogContent') dialogContent!: ElementRef;
  @ViewChild(UserPermissionExternalComponent) userPermissionExternalComponentRef!: UserPermissionExternalComponent;
  @ViewChild(CustomMenuPermissionComponent) customMenuPermissionComponentRef!: CustomMenuPermissionComponent;
  @ViewChild(UserSecurityExternalComponent) userSecurityComponentRef!: UserSecurityExternalComponent;

  get readonly(): boolean {
    return this.operation === OperationTypes.VIEW;
  }

  destroyPopup(): void {
  }

  initPopup(): void {
    this._loadProfiles();
  }

  private _afterViewInit(): void {
    if (this.operation === OperationTypes.UPDATE) {
      this._updatePermissionValidations(true);
      this.displayFormValidity(this.form, this.dialogContent.nativeElement);
    }
    if (this.readonly) {
      this.form.disable();
      this.saveVisible = false;
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
      basic: this.fb.group(this.model.buildForm(true), {validators: this.model.setBasicFormCrossValidations()}),
      userPermissions: this.fb.group({
        customRoleId: [this.model.customRoleId],
        permissions: [false]
      })
    });
  }

  get basicFormGroup(): UntypedFormGroup {
    return this.form.get('basic') as UntypedFormGroup;
  }

  get profileControl(): UntypedFormControl {
    return this.basicFormGroup.get('profileId') as UntypedFormControl;
  }

  get permissionsFormGroup(): UntypedFormGroup {
    return this.form.get('userPermissions') as UntypedFormGroup;
  }

  get customRoleBasicControl(): UntypedFormControl {
    return this.basicFormGroup.get('customRoleId') as UntypedFormControl;
  }

  get customRoleControl(): UntypedFormControl {
    return this.permissionsFormGroup.get('customRoleId') as UntypedFormControl;
  }

  get userPermissionsControl(): UntypedFormControl {
    return this.permissionsFormGroup.get('permissions') as UntypedFormControl;
  }

  get popupTitle(): string {
    if (this.operation === OperationTypes.CREATE) {
      return this.langService.map.lbl_add_org_user;
    } else if (this.operation === OperationTypes.UPDATE) {
      return this.langService.map.lbl_edit_org_user + ' : ' + this.model.getName();
    } else if (this.operation === OperationTypes.VIEW) {
      return this.langService.map.view + ' : ' + this.model.getName();
    }
    return '';
  }

  private _updatePermissionValidations(forceUpdateValueAndValidation: boolean = false) {
    const value = this.customRoleControl?.value;
    if (!value) {
      this.userPermissionsControl.removeValidators(Validators.requiredTrue);
    } else {
      this.userPermissionsControl.addValidators(Validators.requiredTrue);
    }
    if (forceUpdateValueAndValidation) {
      this.userPermissionsControl.updateValueAndValidity();
    }
  }

  updateUserPermissions(isAnyPermissionSelected: boolean): void {
    this.userPermissionsControl?.setValue(isAnyPermissionSelected);
    this.userPermissionsControl?.markAsDirty();
  }

  onCustomRoleChange(value: any, userInteraction: boolean = false) {
    if (this.readonly) {
      return;
    }
    this.customRoleBasicControl?.setValue(value);
    this._updatePermissionValidations(true);
    if (userInteraction) {
      this.customRoleChangedTrigger = !this.customRoleChangedTrigger;
    }
  }

  private _loadProfiles(): void {
    this.profileService.loadAsLookups()
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          return of([]);
        })
      )
      .subscribe((result) => this.profileList = result);
  }

  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }

  private _getInvalidTabs(): any {
    let failedList: string[] = [];
    for (const key in this.tabsData) {
      if (!(this.tabsData[key].validStatus())) {
        // @ts-ignore
        failedList.push(this.langService.map[this.tabsData[key].langKey]);
      }
    }
    return failedList;
  }

  beforeSave(model: ExternalUser, form: UntypedFormGroup): Observable<boolean> | boolean {
    const invalidTabs = this._getInvalidTabs();
    if (invalidTabs.length > 0) {
      const listHtml = CommonUtils.generateHtmlList(this.langService.map.msg_following_tabs_valid, invalidTabs);
      this.dialogService.error(listHtml.outerHTML);
      return false;
    } else {
      return true;
    }
  }

  prepareModel(model: ExternalUser, form: UntypedFormGroup): Observable<ExternalUser> | ExternalUser {
    return new ExternalUser().clone({...this.model, ...this.basicFormGroup?.value});
  }

  prepareUserRequestModel(model: ExternalUser, form: UntypedFormGroup): Observable<ExternalUserUpdateRequest> | ExternalUserUpdateRequest {
    let data: ExternalUserUpdateRequest = new ExternalUserUpdateRequest().clone({
      ...this.model,
      ...this.basicFormGroup?.value,
      externalUserID: model.id,
      generalUserId: model.generalUserId,
      oldPermissionList: !this.userPermissionExternalComponentRef ? [] : this.userPermissionExternalComponentRef.getFinalOldSelectedPermissions(),
      newPermissionList: !this.userPermissionExternalComponentRef ? [] : this.userPermissionExternalComponentRef.getFinalNewSelectedPermissions(),
      oldServicePermissions: !this.userSecurityComponentRef ? [] : this.userSecurityComponentRef.getOldUserSecurity(),
      newServicePermissions: !this.userSecurityComponentRef ? [] : this.userSecurityComponentRef.getFinalUserSecurity(),
      oldMenuList: !this.customMenuPermissionComponentRef ? [] : this.customMenuPermissionComponentRef.getOldUserMenuPermissions(),
      newMenuList: !this.customMenuPermissionComponentRef ? [] : this.customMenuPermissionComponentRef.getFinalUserMenuPermissions(),
      requestType: !model.id ? ExternalUserUpdateRequestTypeEnum.NEW : ExternalUserUpdateRequestTypeEnum.UPDATE,
      requestStatus: ExternalUserUpdateRequestStatusEnum.IN_PROGRESS,
      requestSaveType: this.requestSaveType,
    });
    data.service = this.externalUserUpdateRequestService; // setting service because it is overridden by this.model value

    // when data is prepared by cloning model, external user update request id is replaced by userId. It has to be requestId
    // so, delete it if there is no userRequest available, otherwise set userRequestId to id
    if (!!this.userUpdateRequest) {
      data.id = this.userUpdateRequest.id;
    } else {
      // when user can save directly, we need id to differentiate create/update, but it will be deleted before save user
      if (!this.canSaveDirectly) {
        // @ts-ignore
        delete data.id;
      }
    }
    return data;
  }

  afterSave(model: ExternalUser, dialogRef: DialogRef): void {

  }

  saveFail(error: Error): void {
    this.itemInSaveOperation = undefined
  }

  get isProfileValid(): boolean {
    if (this.readonly) {
      return true;
    }
    return this.profileControl?.valid;
  }

  listenToSave() {
    this.save$
      // call before Save callback
      .pipe(switchMap(() => {
        const result = this.beforeSave(this.model, this.form);
        return isObservable(result) ? result : of(result);
      }))
      // filter the return value from saveBeforeCallback and allow only the true
      .pipe(filter(value => value))
      .pipe(switchMap(_ => {
        const result = this.prepareUserRequestModel(this.model, this.form);
        return isObservable(result) ? result : of(result);
      }))
      .pipe(exhaustMap((model: ExternalUserUpdateRequest) => {
        this.itemInSaveOperation = model;
        let save$ = (model as BaseModel<any, any>).save();
        return save$.pipe(catchError(error => {
          this.saveFail(error);
          return of({
            error: error,
            model
          });
        }));
      }))
      .pipe(filter((value) => !value.hasOwnProperty('error')))
      .subscribe((model: ExternalUserUpdateRequest) => {
        this.afterSaveUserRequest(model, this.dialogRef);
      });
  }

  afterSaveUserRequest(model: ExternalUserUpdateRequest, dialogRef: DialogRef): void {
    let _done: Observable<any>;
    const isCurrentLoggedInUserUpdated = this.employeeService.isCurrentUser({generalUserId: this.itemInSaveOperation!.generalUserId} as ExternalUser);
    if (isCurrentLoggedInUserUpdated && this.canSaveDirectly && this.requestSaveType === 'SAVE_USER') {
      _done = this.authService.validateToken()
        .pipe(
          catchError(() => of(model)),
          map(_ => model)
        );
    } else {
      _done = of(model);
    }
    _done.subscribe((result) => {
      if (!result) {
        return;
      }
      let message = '';
      if (this.canSaveDirectly && this.requestSaveType === 'SAVE_USER') {
        message = (this.operation === OperationTypes.CREATE)
          ? this.langService.map.msg_create_x_success
          : this.langService.map.msg_update_x_success;
      } else {
        message = (this.operation === OperationTypes.CREATE)
          ? this.langService.map.msg_create_request_x_success
          : this.langService.map.msg_update_request_x_success;
      }
      this.toast.success(message.change({x: this.itemInSaveOperation!.getName()}));
      this.itemInSaveOperation = undefined;
      dialogRef.close(model);
    });
  }

  get isSubAdmin() {
    return this.employeeService.userRolesManageUser.isSubAdmin();
  }

  isChangeProfileAllowed(): boolean {
    if (this.isSubAdmin || this.readonly) {
      return false;
    }
    if (this.operation === OperationTypes.CREATE && this.requestSaveType === 'SAVE_USER') {
      return this.employeeService.userRolesManageUser.isSuperAdmin(OperationTypes.CREATE);
    }
    return false;
  }
}
