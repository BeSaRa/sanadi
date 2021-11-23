import {Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {FormManager} from '@app/models/form-manager';
import {LangService} from '@app/services/lang.service';
import {OrgUser} from '@app/models/org-user';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {ToastService} from '@app/services/toast.service';
import {extender} from '@app/helpers/extender';
import {LookupCategories} from '@app/enums/lookup-categories';
import {Lookup} from '@app/models/lookup';
import {LookupService} from '@app/services/lookup.service';
import {OrgUnit} from '@app/models/org-unit';
import {CustomRole} from '@app/models/custom-role';
import {OrgBranch} from '@app/models/org-branch';
import {OrganizationBranchService} from '@app/services/organization-branch.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {combineLatest, of, Subject} from 'rxjs';
import {catchError, exhaustMap, map, switchMap, take, takeUntil} from 'rxjs/operators';
import {Permission} from '@app/models/permission';
import {OrgUserPermission} from '@app/models/org-user-permission';
import {CheckGroup} from '@app/models/check-group';
import {PermissionService} from '@app/services/permission.service';
import {CustomRolePermission} from '@app/models/custom-role-permission';
import {OrganizationUserPermissionService} from '@app/services/organization-user-permission.service';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {EmployeeService} from '@app/services/employee.service';
import {AuthService} from '@app/services/auth.service';
import {ExceptionHandlerService} from '@app/services/exception-handler.service';
import {UserTeamComponent} from "@app/administration/shared/user-team/user-team.component";
import {TabComponent} from "@app/shared/components/tab/tab.component";

@Component({
  selector: 'app-organization-user-popup',
  templateUrl: './organization-user-popup.component.html',
  styleUrls: ['./organization-user-popup.component.scss']
})
export class OrganizationUserPopupComponent implements OnInit, OnDestroy {
  private save$: Subject<any> = new Subject<any>();
  private destroy$: Subject<any> = new Subject<any>();
  form!: FormGroup;
  model: OrgUser;
  operation: OperationTypes;
  fm!: FormManager;
  userTypeList: Lookup[];
  jobTitleList: Lookup[];
  customRoleList: CustomRole[];
  orgUnitList: OrgUnit[];
  orgUserPermissions: OrgUserPermission[];
  permissionList: Permission[] = [];
  orgBranchList!: OrgBranch[];
  orgUserStatusList!: Lookup[];

  selectedRole?: CustomRole;
  permissions!: Record<number, Permission[][]>;
  selectedPermissions: number[] = [];
  groups: CheckGroup<Permission>[] = [];

  tabsData: IKeyValue = {
    basic: {name: 'basic'},
    permissions: {name: 'permissions'}
  };
  saveVisible = true;
  validateFieldsVisible = true;

  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  @ViewChild(UserTeamComponent)
  userTeamComponent!: UserTeamComponent;

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

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<OrgUser>,
              private toast: ToastService, public langService: LangService,
              private organizationBranchService: OrganizationBranchService,
              private permissionService: PermissionService,
              private userPermissionService: OrganizationUserPermissionService,
              private lookupService: LookupService,
              private employeeService: EmployeeService,
              private authService: AuthService,
              private fb: FormBuilder,
              private exceptionHandlerService: ExceptionHandlerService) {
    this.model = data.model;
    this.operation = data.operation;
    this.customRoleList = data.customRoleList;
    this.orgUnitList = data.orgUnitList;
    this.orgUserPermissions = data.orgUserPermissions;
    this.userTypeList = lookupService.getByCategory(LookupCategories.ORG_USER_TYPE);
    this.jobTitleList = lookupService.getByCategory(LookupCategories.ORG_USER_JOB_TITLE);
    this.orgUserStatusList = lookupService.getByCategory(LookupCategories.ORG_USER_STATUS);
    this._setDefaultPermissions();

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
  }

  buildForm(): void {
    this.form = this.fb.group({
      basic: this.fb.group({
        orgId: [this.model.orgId, CustomValidators.required],
        orgBranchId: [this.model.orgBranchId, [CustomValidators.required]],
        userType: [this.model.userType, CustomValidators.required],
        arName: [this.model.arName, [
          CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
          Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('AR_NUM')
        ]],
        enName: [this.model.enName, [
          CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
          Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG_NUM')
        ]],
        qid: [this.model.qid, [CustomValidators.required].concat(CustomValidators.commonValidations.qId)],
        empNum: [this.model.empNum, [CustomValidators.required, CustomValidators.number, Validators.maxLength(10)]],
        phoneNumber: [this.model.phoneNumber, [
          CustomValidators.required, CustomValidators.number, Validators.maxLength(CustomValidators.defaultLengths.PHONE_NUMBER_MAX)]],
        phoneExtension: [this.model.phoneExtension, [CustomValidators.number, Validators.maxLength(10)]],
        officialPhoneNumber: [this.model.officialPhoneNumber, [
          CustomValidators.number, Validators.maxLength(CustomValidators.defaultLengths.PHONE_NUMBER_MAX)]],
        email: [this.model.email, [
          CustomValidators.required, Validators.email, Validators.maxLength(CustomValidators.defaultLengths.EMAIL_MAX)]],
        jobTitle: [this.model.jobTitle, [CustomValidators.required]],
        status: [this.model.status, CustomValidators.required],
        customRoleId: [this.model.customRoleId] // not required as it is dummy to be tracked from permissions tab
      }, {
        validators: CustomValidators.validateFieldsStatus([
          'arName', 'enName', 'empNum', 'qid', 'phoneNumber', 'phoneExtension',
          'officialPhoneNumber', 'email', 'userType', 'jobTitle', 'orgId', 'orgBranchId', 'status'
        ])
      }),
      permissions: this.fb.group({
        customRoleId: [this.model.customRoleId, CustomValidators.required],
        permissions: [!!this.selectedPermissions.length, Validators.requiredTrue]
      })
    });
    this.fm = new FormManager(this.form, this.langService);
    this.bindOrgBranchList();
    // will check it later
    if (this.operation === OperationTypes.UPDATE) {
      this.fm.displayFormValidity();
    }
  }

  saveModel(): void {
    this.save$.next();
  }

  _saveModel(): void {
    this.save$.pipe(
      takeUntil(this.destroy$),
      exhaustMap(() => {
        const orgUser = extender<OrgUser>(OrgUser, {...this.model, ...this.fm.getFormField('basic')?.value});
        return orgUser.save()
          .pipe(
            catchError((err) => {
              this.exceptionHandlerService.handle(err);
              return of(null);
            }),
            switchMap((savedUser: OrgUser | null) => {
              if (!savedUser) {
                return of(savedUser);
              }
              return this.userPermissionService.saveBulkUserPermissions(savedUser.id, this.selectedPermissions)
                .pipe(
                  catchError((err) => {
                    this.exceptionHandlerService.handle(err);
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

  onOrgUnitChange(): void {
    this.fm.getFormField('basic.orgBranchId')?.setValue(null);
    this.bindOrgBranchList();
  }

  bindOrgBranchList(): void {
    this.orgBranchList = [];
    if (!this.fm.getFormField('basic.orgId')?.value) {
      return;
    }
    this.organizationBranchService.loadByCriteria({'org-id': this.fm.getFormField('basic.orgId')?.value})
      .subscribe((orgBranch: OrgBranch[]) => {
        this.orgBranchList = orgBranch;
      });
  }

  get popupTitle(): string {
    return this.operation === OperationTypes.CREATE ? this.langService.map.lbl_add_org_user : this.langService.map.lbl_edit_org_user;
  }


  private buildPermissionGroups(): void {
    combineLatest([this.permissionService.load(), of(this.lookupService.getByCategory(LookupCategories.ORG_USER_PERMISSION_GROUP))])
      .pipe(take(1))
      .subscribe((result) => {
        const permissionByGroupId = OrganizationUserPopupComponent.buildPermissionsByGroupId(result[0]);
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
        this.orgUserPermissions.map((item: OrgUserPermission) => {
          if (!!item.permissionId) {
            this.selectedPermissions.push(item.permissionId);
          }
          return item;
        });
      }
    }
  }

  // noinspection JSUnusedLocalSymbols
  updatePermissionsByRole($event: Event): void {
    const value = this.fm.getFormField('permissions.customRoleId')?.value;
    if (!value) {
      this.selectedPermissions = [];
    } else {
      const role = this.customRoleList.find((item) => item.id === value);
      this.selectedPermissions = !role ? [] : role.permissionSet.map((item: CustomRolePermission) => {
        return item.permissionId;
      });
    }
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
    this.fm.getFormField('permissions.permissions')?.setValue(this.groups.some((group) => {
      return group.hasSelectedValue();
    }));
  }

  private setSelectedPermissions(): void {
    this.selectedPermissions = this.groups.reduce((acc, current) => {
      return acc.concat(current.getSelectedValue());
    }, [] as number[]);
  }

  private listenToCustomRoleChange() {
    this.fm
      .getFormField('permissions.customRoleId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.fm.getFormField('basic.customRoleId')?.setValue(value);
      });
  }

  onTabChange($event: TabComponent) {
    this.displaySaveBtn = (!['services', 'teams'].includes($event.name))
  }
}
