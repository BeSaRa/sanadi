import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
import {CustomValidators} from '@app/validators/custom-validators';
import {combineLatest, of, Subject} from 'rxjs';
import {catchError, exhaustMap, filter, map, switchMap, take, takeUntil} from 'rxjs/operators';
import {Permission} from '@app/models/permission';
import {ExternalUserPermission} from '@app/models/external-user-permission';
import {CheckGroup} from '@app/models/check-group';
import {PermissionService} from '@app/services/permission.service';
import {CustomRolePermission} from '@app/models/custom-role-permission';
import {ExternalUserPermissionService} from '@services/external-user-permission.service';
import {EmployeeService} from '@app/services/employee.service';
import {AuthService} from '@app/services/auth.service';
import {TabComponent} from '@app/shared/components/tab/tab.component';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {JobTitle} from '@app/models/job-title';
import {JobTitleService} from '@services/job-title.service';
import {Profile} from '@app/models/profile';
import {ProfileService} from '@services/profile.service';
import {CommonUtils} from '@helpers/common-utils';
import {TabMap} from '@app/types/types';
import {DialogService} from '@services/dialog.service';

@Component({
  selector: 'app-external-user-popup',
  templateUrl: './external-user-popup.component.html',
  styleUrls: ['./external-user-popup.component.scss']
})
export class ExternalUserPopupComponent implements OnInit, AfterViewInit, OnDestroy {
  private save$: Subject<any> = new Subject<any>();
  private destroy$: Subject<any> = new Subject<any>();
  list: ExternalUser[] = [];
  form!: UntypedFormGroup;
  model: ExternalUser;
  operation: OperationTypes;
  jobTitleList: JobTitle[] = [];
  profileList: Profile[] = [];
  customRoleList: CustomRole[];
  orgUserPermissions: ExternalUserPermission[];
  permissionList: Permission[] = [];
  statusList!: Lookup[];

  permissions!: Record<number, Permission[][]>;
  selectedPermissions: number[] = [];
  groups: CheckGroup<Permission>[] = [];

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
    services: {name: 'services', index: 2, langKey: 'link_services', validStatus: () => true, isTouchedOrDirty: () => true},

  };
  validateFieldsVisible = true;

  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  commonStatusEnum = CommonStatusEnum;

  displaySaveBtn: boolean = true;

  static buildPermissionsByGroupId(permissions: Permission[]): any {
    return permissions.reduce((acc, current) => {
      if (!acc.hasOwnProperty(current.groupId)) {
        acc[current.groupId] = [];
      }
      acc[current.groupId].push(current);
      return acc;
    }, {} as any);
  }

  @ViewChild('dialogContent') dialogContent!: ElementRef;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<ExternalUser>,
              private toast: ToastService, public langService: LangService,
              private permissionService: PermissionService,
              private userPermissionService: ExternalUserPermissionService,
              private lookupService: LookupService,
              public employeeService: EmployeeService,
              private authService: AuthService,
              private jobTitleService: JobTitleService,
              private profileService: ProfileService,
              private dialogService: DialogService,
              private cd: ChangeDetectorRef,
              private fb: UntypedFormBuilder) {
    this.model = data.model;
    this.operation = data.operation;
    this.customRoleList = data.customRoleList;
    this.orgUserPermissions = data.orgUserPermissions;
    this.statusList = lookupService.listByCategory.CommonStatus;
    this._setDefaultPermissions();
  }

  get readonly(): boolean {
    return this.operation === OperationTypes.VIEW;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.buildPermissionGroups();
    this.buildForm();
    this._saveModel();
    this.listenToCustomRoleChange();
    this._loadJobTitles();
    this._loadProfiles();
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
      basic: this.fb.group({
        arName: [this.model.arName, [
          CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
          Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('AR_NUM')
        ]],
        enName: [this.model.enName, [
          CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
          Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG_NUM')
        ]],
        qid: [{
          value: this.model.qid,
          disabled: !!this.model.id
        }, [CustomValidators.required].concat(CustomValidators.commonValidations.qId)],
        empNum: [this.model.empNum, [CustomValidators.required, CustomValidators.number, Validators.maxLength(10)]],
        phoneNumber: [this.model.phoneNumber, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)],
        phoneExtension: [this.model.phoneExtension, [CustomValidators.number, Validators.maxLength(10)]],
        officialPhoneNumber: [this.model.officialPhoneNumber, CustomValidators.commonValidations.phone],
        email: [this.model.email, [
          CustomValidators.required, Validators.email, Validators.maxLength(CustomValidators.defaultLengths.EMAIL_MAX)]],
        jobTitle: [this.model.jobTitle, [CustomValidators.required]],
        status: [this.model.status, CustomValidators.required],
        profileId: [this.model.profileId, CustomValidators.required],
        customRoleId: [this.model.customRoleId] // not required as it is dummy to be tracked from permissions tab
      }, {
        validators: CustomValidators.validateFieldsStatus([
          'arName', 'enName', 'empNum', 'qid', 'phoneNumber', 'phoneExtension',
          'officialPhoneNumber', 'email', 'jobTitle', 'status', 'profileId'
        ])
      }),
      permissions: this.fb.group({
        customRoleId: [this.model.customRoleId],
        permissions: [!!this.selectedPermissions.length]
      })
    });
  }

  get basicFormGroup(): UntypedFormGroup {
    return this.form.get('basic') as UntypedFormGroup;
  }

  get permissionsFormGroup(): UntypedFormGroup {
    return this.form.get('permissions') as UntypedFormGroup;
  }

  get customRoleBasicControl(): UntypedFormControl {
    return this.basicFormGroup.get('customRoleId') as UntypedFormControl;
  }

  get customRoleControl(): UntypedFormControl {
    return this.permissionsFormGroup.get('customRoleId') as UntypedFormControl;
  }

  get permissionsControl(): UntypedFormControl {
    return this.permissionsFormGroup.get('permissions') as UntypedFormControl;
  }

  saveModel(): void {
    this.save$.next();
  }

  displayFormValidity(form?: UntypedFormGroup | null, element?: HTMLElement | string): void {
    CommonUtils.displayFormValidity(form || this.form, this.dialogContent.nativeElement);
  }

  _saveModel(): void {
    this.save$.pipe(
      takeUntil(this.destroy$),
      filter(()=> {
        const invalidTabs = this._getInvalidTabs();
        if (invalidTabs.length > 0) {
          const listHtml = CommonUtils.generateHtmlList(this.langService.map.msg_following_tabs_valid, invalidTabs);
          this.dialogService.error(listHtml.outerHTML);
          return false;
        } else {
          return true;
        }
      }),
      exhaustMap(() => {
        const orgUser = new ExternalUser().clone({...this.model, ...this.basicFormGroup?.value});
        return orgUser.save()
          .pipe(
            catchError(() => {
              return of(null);
            }),
            switchMap((savedUser: ExternalUser | null) => {
              if (!savedUser) {
                return of(savedUser);
              }
              return this.userPermissionService.saveBulkUserPermissions(savedUser.id, this.selectedPermissions)
                .pipe(
                  catchError(() => {
                    return of(null);
                  }),
                  map(() => {
                    return savedUser;
                  })
                );
            }));
      }),
      switchMap((user) => {
        if (!user) {
          return of(user);
        }
        // noinspection JSUnusedLocalSymbols
        return this.employeeService.isCurrentEmployee(user) ? this.authService.validateToken()
          .pipe(catchError(error => of(user)), map(_ => user)) : of(user);
      }),
    ).subscribe((user) => {
      if (!user) {
        return;
      }
      const message = (this.operation === OperationTypes.CREATE)
        ? this.langService.map.msg_create_x_success : this.langService.map.msg_update_x_success;
      // @ts-ignore
      this.toast.success(message.change({x: user.arName}));
      this.model = user;
      this.operation = OperationTypes.UPDATE;
    });
  }

  get popupTitle(): string {
    if (this.operation === OperationTypes.CREATE) {
      return this.langService.map.lbl_add_org_user;
    } else if (this.operation === OperationTypes.UPDATE) {
      return this.langService.map.lbl_edit_org_user;
    } else if (this.operation === OperationTypes.VIEW) {
      return this.langService.map.view;
    }
    return '';
  }


  private buildPermissionGroups(): void {
    combineLatest([this.permissionService.loadAsLookups(), of(this.lookupService.listByCategory.ExternalUserPermissionGroup)])
      .pipe(take(1))
      .subscribe((result) => {
        const permissionByGroupId = ExternalUserPopupComponent.buildPermissionsByGroupId(result[0]);
        result[1].forEach((group: Lookup) => {
          this.groups.push(new CheckGroup<Permission>(group, permissionByGroupId[group.lookupKey], this.selectedPermissions, 3));
        });
      });
  }

  private _setDefaultPermissions(): void {
    if (this.operation === OperationTypes.CREATE) {
      this.selectedPermissions = [];
    } else {
      if (this.operation === OperationTypes.UPDATE && this.orgUserPermissions && this.orgUserPermissions.length > 0) {
        this.orgUserPermissions.map((item: ExternalUserPermission) => {
          if (!!item.permissionId) {
            this.selectedPermissions.push(item.permissionId);
          }
          return item;
        });
      }
    }
  }

  private _updatePermissionValidations(forceUpdateValueAndValidation: boolean = false) {
    const value = this.customRoleControl?.value;
    if (!value) {
      this.permissionsControl.removeValidators(Validators.requiredTrue);
    } else {
      this.permissionsControl.addValidators(Validators.requiredTrue);
    }
    if (forceUpdateValueAndValidation) {
      this.permissionsControl.updateValueAndValidity();
    }
  }

  // noinspection JSUnusedLocalSymbols
  updatePermissionsByRole($event: Event): void {
    const value = this.customRoleControl?.value;
    if (!value) {
      this.selectedPermissions = [];
    } else {
      const role = this.customRoleList.find((item) => item.id === value);
      this.selectedPermissions = !role ? [] : role.permissionSet.map((item: CustomRolePermission) => {
        return item.permissionId;
      });
    }
    this._updatePermissionValidations(true);
    this.groups.forEach(group => {
      group.setSelected(this.selectedPermissions);
    });
    this.updatePermissionFormField();
  }

  onGroupClicked(group: CheckGroup<Permission>): void {
    group.toggleSelection();
    this.updatePermissionFormField();
  }

  onPermissionClicked($event: Event, permission: Permission, group: CheckGroup<Permission>): void {
    const checkBox = $event.target as HTMLInputElement;
    checkBox.checked ? group.addToSelection(Number(checkBox.value)) : group.removeFromSelection(Number(checkBox.value));
    checkBox.checked ? this.addToSelection(Number(checkBox.value)) : this.removeFromSelection(Number(checkBox.value));
    this.updatePermissionFormField();
  }

  private addToSelection(permission: number): void {
    this.selectedPermissions.push(permission);
  }

  private removeFromSelection(permission: number): void {
    this.selectedPermissions.splice(this.selectedPermissions.indexOf(permission), 1);
  }

  private updatePermissionFormField(): void {
    this.setSelectedPermissions();
    this.permissionsControl?.setValue(this.groups.some((group) => {
      return group.hasSelectedValue();
    }));
  }

  private setSelectedPermissions(): void {
    this.selectedPermissions = this.groups.reduce((acc, current) => {
      return acc.concat(current.getSelectedValue());
    }, [] as number[]);
  }

  private listenToCustomRoleChange() {
    this.customRoleControl?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.customRoleBasicControl?.setValue(value);
      });
  }

  onTabChange($event: TabComponent) {
    this.displaySaveBtn = (!['services', 'teams'].includes($event.name));
    this.validateFieldsVisible = (!['services', 'teams'].includes($event.name));
  }

  private _loadJobTitles(): void {
    this.jobTitleService.loadAsLookups()
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          return of([]);
        })
      )
      .subscribe((result) => this.jobTitleList = result);
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
}
