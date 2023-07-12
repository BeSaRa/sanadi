import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { LangService } from '@app/services/lang.service';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { CustomRole } from '@app/models/custom-role';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { LookupService } from '@app/services/lookup.service';
import { combineLatest, Observable, of } from 'rxjs';
import { PermissionService } from '@app/services/permission.service';
import { map, take } from 'rxjs/operators';
import { Permission } from '@app/models/permission';
import { CheckGroup } from '@app/models/check-group';
import { CustomRolePermission } from '@app/models/custom-role-permission';
import { ToastService } from '@app/services/toast.service';
import { CustomRolePermissionService } from '@app/services/custom-role-permission.service';
import { Lookup } from '@app/models/lookup';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { AdminGenericDialog } from '@app/generics/admin-generic-dialog';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { CommonUtils } from '@app/helpers/common-utils';
import { DialogService } from '@app/services/dialog.service';
import { TabComponent } from "@app/shared/components/tab/tab.component";
import { CommonStatusEnum } from '@app/enums/common-status.enum';

@Component({
  selector: 'app-custom-role-popup',
  templateUrl: './custom-role-popup.component.html',
  styleUrls: ['./custom-role-popup.component.scss']
})
export class CustomRolePopupComponent extends AdminGenericDialog<CustomRole> implements AfterViewInit {
  constructor(public dialogRef: DialogRef,
    @Inject(DIALOG_DATA_TOKEN) data: IDialogData<CustomRole>,
    private lookupService: LookupService,
    public fb: UntypedFormBuilder,
    private toast: ToastService,
    private cd: ChangeDetectorRef,
    private dialogService: DialogService,
    private customRolePermissionService: CustomRolePermissionService,
    private permissionService: PermissionService,
    public langService: LangService) {
    super();
    this.operation = data.operation;
    this.model = data.model;
    this.selectedPermissions = data.customRolePermissions.map((item: CustomRolePermission) => {
      return item.permissionId;
    });
  }

  @ViewChild('dialogContent') dialogContent!: ElementRef;

  form!: UntypedFormGroup;
  model: CustomRole;
  operation: OperationTypes;
  saveVisible = true;
  status = this.lookupService.listByCategory.CommonStatus.filter((e) => !e.isRetiredCommonStatus());

  permissions!: Record<number, Permission[][]>;
  selectedPermissions: number[] = [];
  groups: CheckGroup<Permission>[] = [];
  tabsData: IKeyValue = {
    basic: {
      name: 'basic',
      langKey: 'lbl_basic_info',
      validStatus: () => this.form && this.basicInfoGroup && this.basicInfoGroup.valid
    },
    permissions: {
      name: 'permissions',
      langKey: 'lbl_permissions',
      validStatus: () => this.form && this.permissionsGroup && this.permissionsGroup.valid
    }
  };

  private _afterViewInit(): void {
    if (this.operation === OperationTypes.UPDATE) {
      this.displayFormValidity(null, this.dialogContent.nativeElement);
    }
  }

  ngAfterViewInit(): void {
    // used the private function to reuse functionality of afterViewInit if needed
    this._afterViewInit();
    this.cd.detectChanges();
  }

  get popupTitle(): string {
    if (this.operation === OperationTypes.CREATE) {
      return this.langService.map.lbl_add_custom_role;
    } else if (this.operation === OperationTypes.UPDATE) {
      return this.langService.map.lbl_edit_custom_role;
    } else if (this.operation === OperationTypes.VIEW) {
      return this.langService.map.view;
    }
    return '';
  };

  get basicInfoGroup(): UntypedFormGroup {
    return this.form.get('basic') as UntypedFormGroup;
  }

  get permissionsGroup(): AbstractControl {
    return this.form.get('permissions') as AbstractControl;
  }

  get statusField(): UntypedFormControl {
    return this.basicInfoGroup.get('status') as UntypedFormControl;
  }

  setDialogButtonsVisibility(_tab: TabComponent): void {
    this.saveVisible = this.operation !== OperationTypes.VIEW;
    this.validateFieldsVisible = this.operation !== OperationTypes.VIEW;
  }

  initPopup(): void {
    this.buildGroups();
    this.buildForm();
  }

  private buildGroups() {
    combineLatest([this.permissionService.loadAsLookups(), of(this.lookupService.listByCategory.ExternalUserPermissionGroup)])
      .pipe(take(1))
      .subscribe((result) => {
        const permissionByGroupId = CustomRolePopupComponent.buildPermissionsByGroupId(result[0]);
        result[1].forEach((group: Lookup) => {
          this.groups.push(new CheckGroup<Permission>(group, permissionByGroupId[group.lookupKey], this.selectedPermissions));
        });
      });
  }

  public buildForm(): void {
    this.form = this.fb.group({
      basic: this.fb.group(this.model.buildForm(true), { validators: this.model.setBasicFormCrossValidations() }),
      permissions: [!!this.selectedPermissions.length, Validators.requiredTrue]
    });
  }

  onGroupClicked(group: CheckGroup<Permission>): void {
    group.toggleSelection();
    this.updatePermissionFormField();
  }

  onPermissionClicked($event: Event, permission: Permission, group: CheckGroup<Permission>) {
    const checkBox = $event.target as HTMLInputElement;
    checkBox.checked ? group.addToSelection(Number(checkBox.value)) : group.removeFromSelection(Number(checkBox.value));
    checkBox.checked ? this.addToSelection(Number(checkBox.value)) : this.removeFromSelection(Number(checkBox.value));
    this.updatePermissionFormField();
  }

  static buildPermissionsByGroupId(permissions: Permission[]) {
    return permissions.reduce((acc, current) => {
      if (!acc.hasOwnProperty(current.groupId)) {
        acc[current.groupId] = [];
      }
      acc[current.groupId].push(current);
      return acc;
    }, {} as any);
  }

  private addToSelection(number: number) {
    this.selectedPermissions.push(number);
  }

  private removeFromSelection(number: number) {
    this.selectedPermissions.splice(this.selectedPermissions.indexOf(number), 1);
  }

  private updatePermissionFormField() {
    this.setSelectedPermissions();
    this.permissionsGroup?.setValue(this.groups.some((group) => {
      return group.hasSelectedValue();
    }));
  }

  private setSelectedPermissions(): void {
    this.selectedPermissions = this.groups.reduce((acc, current) => {
      return acc.concat(current.getSelectedValue());
    }, [] as number[]);
  }

  beforeSave(model: CustomRole, form: UntypedFormGroup): boolean | Observable<boolean> {
    const invalidTabs = this._getInvalidTabs();
    if (invalidTabs.length > 0) {
      const listHtml = CommonUtils.generateHtmlList(this.langService.map.msg_following_tabs_valid, invalidTabs);
      this.dialogService.error(listHtml.outerHTML);
      return false;
    } else {
      return true;
    }
  }

  private _getUpdatedValues(model: CustomRole, form?: UntypedFormGroup): CustomRole {
    if (!form) {
      form = this.form;
    }

    let customRole = (new CustomRole()).clone({ ...model, ...form.value.basic });
    customRole.setPermissionSet(this.selectedPermissions);
    return customRole;
  }

  prepareModel(model: CustomRole, form: UntypedFormGroup): CustomRole | Observable<CustomRole> {
    return this._getUpdatedValues(model, form);
  }

  afterSave(model: CustomRole, dialogRef: DialogRef): void {
    const message = (this.operation === OperationTypes.CREATE)
      ? this.langService.map.msg_create_x_success
      : this.langService.map.msg_update_x_success;
    this.model = model;
    this.operation = OperationTypes.UPDATE;
    this.toast.success(message.change({ x: model.getName() }));
  }

  saveFail(error: Error): void {
  }

  destroyPopup(): void {
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
