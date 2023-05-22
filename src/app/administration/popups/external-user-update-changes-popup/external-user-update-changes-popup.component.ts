import { ExternalUserUpdateRequestStatusEnum } from '@app/enums/external-user-update-request-status.enum';
import {Component, Inject, OnInit} from '@angular/core';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@contracts/i-dialog-data';
import {ExternalUserUpdateRequest} from '@app/models/external-user-update-request';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {LangService} from '@services/lang.service';
import {ExternalUserUpdateRequestService} from '@services/external-user-update-request.service';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {ToastService} from '@services/toast.service';
import {ExternalUser} from '@app/models/external-user';
import {Permission} from '@app/models/permission';
import {AdminResult} from '@app/models/admin-result';
import {CustomMenu} from '@app/models/custom-menu';
import {ServiceData} from '@app/models/service-data';
import {IExternalUserBasicInfoDifference, IExternalUserServicePermissionDifference} from '@contracts/i-external-user-basic-info-difference';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';

@Component({
  selector: 'external-user-update-changes-popup',
  templateUrl: './external-user-update-changes-popup.component.html',
  styleUrls: ['./external-user-update-changes-popup.component.scss']
})
export class ExternalUserUpdateChangesPopupComponent implements OnInit {
  model: ExternalUserUpdateRequest;
  operation: OperationTypes;
  externalUser: ExternalUser;
  allPermissions: Permission[];
  allCustomMenus: CustomMenu[];
  allServices: ServiceData[];
  actionIconsEnum = ActionIconsEnum;
  externalUserUpdateRequestStatusEnum = ExternalUserUpdateRequestStatusEnum;

  constructor(public lang: LangService,
              public dialogRef: DialogRef,
              @Inject(DIALOG_DATA_TOKEN) data: IDialogData<ExternalUserUpdateRequest>,
              public service: ExternalUserUpdateRequestService,
              private toast: ToastService) {
    this.model = data.model;
    this.operation = data.operation;
    this.externalUser = data.externalUser;
    this.allPermissions = data.allPermissions;
    this.allCustomMenus = data.allCustomMenus;
    this.allServices = data.allServices;
  }

  ngOnInit() {
    this.oldBasicInfo = this.externalUser.getBasicControlValues();
    this.newBasicInfo = this.model.getBasicControlValues();
    this._castServicePermissions();
    this._findDifferences();
  }

  oldBasicInfo!: Partial<ExternalUser>;
  newBasicInfo!: Partial<ExternalUser>;
  basicInfoDifferences: IExternalUserBasicInfoDifference[] = [];
  addedPermissionsList: Permission[] = [];
  removedPermissionsList: Permission[] = [];
  addedUserMenusList: CustomMenu[] = [];
  removedUserMenusList: CustomMenu[] = [];
  addedSystemUserMenusList: CustomMenu[] = [];
  removedSystemUserMenusList: CustomMenu[] = [];
  servicePermissionDifferences: IExternalUserServicePermissionDifference[] = [];

  basicInfoDisplayedColumns: string[] = ['fieldName', 'oldValue', 'newValue'];
  addedPermissionsDisplayedColumns: string[] = ['permissions'];
  removedPermissionsDisplayedColumns: string[] = ['permissions'];
  addedMenusDisplayedColumns: string[] = ['menus'];
  removedMenusDisplayedColumns: string[] = ['menus'];
  servicePermissionDisplayedColumns: string[] = ['serviceName', 'add', 'search', 'teamInbox', 'approval', 'followUp'];

  private _findDifferences() {
    this._getBasicInfoDifferences();
    this._getAddedUserPermissions();
    this._getRemovedUserPermissions();
    this._getAddedUserCustomMenus();
    this._getRemovedUserCustomMenus();
  }

  private getAdminResultValue(key: keyof ExternalUser, isUpdatedValue: boolean) {
    let adminResultValue;
    const value = isUpdatedValue ? this.model : this.externalUser;
    switch (key) {
      case 'customRoleId':
        adminResultValue = value.customRoleInfo;
        break;
      case 'profileId':
        adminResultValue = value.profileInfo;
        break;
      case 'status':
        adminResultValue = value.statusInfo;
        break;
      case 'userType':
        adminResultValue = value.userTypeInfo;
        break;
      case 'jobTitle':
        adminResultValue = value.jobTitleInfo;
        break;
      default:
        // @ts-ignore
        adminResultValue = AdminResult.createInstance({arName: value[key] as string, enName: value[key] as string});
    }
    return adminResultValue ?? new AdminResult();
  }

  private _getBasicInfoDifferences(): void {
    const labelLangKeys = this.externalUser.getBasicControlLabels();
    for (const [key, oldValue] of Object.entries(this.oldBasicInfo)) {
      const newValue = this.newBasicInfo[key as keyof ExternalUser];
      if (oldValue !== newValue) {
        this.basicInfoDifferences.push({
          oldValueInfo: this.getAdminResultValue(key as keyof ExternalUser, false),
          newValueInfo: this.getAdminResultValue(key as keyof ExternalUser, true),
          labelInfo: AdminResult.createInstance({
            arName: this.lang.getArabicLocalByKey(labelLangKeys[key]),
            enName: this.lang.getEnglishLocalByKey(labelLangKeys[key])
          })
        });
      }
    }
  }

  private _getAddedUserPermissions(): void {
    this.model.newPermissionList.map((newPermissionId) => {
      if (!this.model.oldPermissionList.includes(newPermissionId)) {
        const addedPermission = this.allPermissions.find(item => item.id === newPermissionId);
        if (!!addedPermission) {
          this.addedPermissionsList.push(addedPermission);
        }
      }
    });
  }

  private _getRemovedUserPermissions(): void {
    this.model.oldPermissionList.map((oldPermissionId) => {
      if (!this.model.newPermissionList.includes(oldPermissionId)) {
        const removedPermission = this.allPermissions.find(item => item.id === oldPermissionId);
        if (!!removedPermission) {
          this.removedPermissionsList.push(removedPermission);
        }
      }
    });
  }

  private _getAddedUserCustomMenus(): void {
    this.model.newMenuList.map((newMenuId) => {
      if (!this.model.oldMenuList.includes(newMenuId)) {
        const addedMenu = this.allCustomMenus.find(item => item.id === newMenuId);
        if (!!addedMenu) {
          if (!!addedMenu.systemMenuKey){
            this.addedSystemUserMenusList.push(addedMenu);
          } else {
            this.addedUserMenusList.push(addedMenu);
          }
        }
      }
    });
  }

  private _getRemovedUserCustomMenus(): void {
    this.model.oldMenuList.map((oldMenuId) => {
      if (!this.model.newMenuList.includes(oldMenuId)) {
        const removedMenu = this.allCustomMenus.find(item => item.id === oldMenuId);
        if (!!removedMenu) {
          if (!!removedMenu.systemMenuKey){
            this.removedSystemUserMenusList.push(removedMenu);
          } else {
            this.removedUserMenusList.push(removedMenu);
          }
        }
      }
    });
  }

  private _castServicePermissions(): void {
    this.servicePermissionDifferences = [];
    this.model.newServicePermissions.forEach((newServicePermission) => {
      const oldPermission = this.model.oldServicePermissions.find(x => x.serviceId === newServicePermission.serviceId);
      let servicePermissionDifference: IExternalUserServicePermissionDifference = {
        serviceInfo: this.allServices.find(service => service.id === newServicePermission.serviceId)?.convertToAdminResult() ?? new AdminResult()
      } as IExternalUserServicePermissionDifference;
      if (!oldPermission) {
        servicePermissionDifference.canManageOld = false;
        servicePermissionDifference.canAddOld = false;
        servicePermissionDifference.canViewOld = false;
        servicePermissionDifference.approvalOld = false;
        servicePermissionDifference.followUpOld = false;
      } else {
        servicePermissionDifference.canManageOld = oldPermission.canManage;
        servicePermissionDifference.canAddOld = oldPermission.canAdd;
        servicePermissionDifference.canViewOld = oldPermission.canView;
        servicePermissionDifference.approvalOld = oldPermission.approval;
        servicePermissionDifference.followUpOld = oldPermission.followUp;
      }
      servicePermissionDifference.canManageNew = newServicePermission.canManage;
      servicePermissionDifference.canAddNew = newServicePermission.canAdd;
      servicePermissionDifference.canViewNew = newServicePermission.canView;
      servicePermissionDifference.approvalNew = newServicePermission.approval;
      servicePermissionDifference.followUpNew = newServicePermission.followUp;

      this.servicePermissionDifferences.push(servicePermissionDifference);
    });
  }

  acceptRequest(): void {
    this.service.acceptRequest(this.model)
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.toast.success(this.lang.map.msg_accept_x_success.change({x: this.model.getName()}));
        this.dialogRef.close(true);
      });
  }

  rejectRequest(): void {
    this.service.rejectRequestWithReason(this.model)
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.toast.success(this.lang.map.msg_reject_x_success.change({x: this.model.getName()}));
        this.dialogRef.close(true);
      });
  }
}
