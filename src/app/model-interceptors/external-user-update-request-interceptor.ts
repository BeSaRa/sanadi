import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {ExternalUserUpdateRequest} from '@app/models/external-user-update-request';
import {CommonUtils} from '@helpers/common-utils';
import {UserSecurityConfigurationInterceptor} from '@app/model-interceptors/user-security-configuration-interceptor';
import {UserSecurityConfiguration} from '@app/models/user-security-configuration';
import {GeneralInterceptor} from '@app/model-interceptors/general-interceptor';
import {DateUtils} from '@helpers/date-utils';
import {AdminResult} from '@app/models/admin-result';

const userSecurityConfigurationInterceptor = new UserSecurityConfigurationInterceptor();

export class ExternalUserUpdateRequestInterceptor implements IModelInterceptor<ExternalUserUpdateRequest> {
  receive(model: ExternalUserUpdateRequest): ExternalUserUpdateRequest {
    model.updatedOnString = DateUtils.getDateStringFromDate(model.updatedOn, 'DEFAULT_DATE_FORMAT');
    model.statusInfo && (model.statusInfo = AdminResult.createInstance(model.statusInfo));
    model.userTypeInfo && (model.userTypeInfo = AdminResult.createInstance(model.userTypeInfo));
    model.requestStatusInfo && (model.requestStatusInfo = AdminResult.createInstance(model.requestStatusInfo));
    model.customRoleInfo && (model.customRoleInfo = AdminResult.createInstance(model.customRoleInfo));
    model.jobTitleInfo && (model.jobTitleInfo = AdminResult.createInstance(model.jobTitleInfo));
    model.nationalityInfo && (model.nationalityInfo = AdminResult.createInstance(model.nationalityInfo));
    model.profileInfo && (model.profileInfo = AdminResult.createInstance(model.profileInfo));
    model.requestTypeInfo && (model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo));
    model.updateByInfo && (model.updateByInfo = AdminResult.createInstance(model.updateByInfo));
    model.newPermissionList = model.newPermissionList ?? [];
    model.oldPermissionList = model.oldPermissionList ?? [];
    model.oldServicePermissions = (model.oldServicePermissions ?? []).map(x => userSecurityConfigurationInterceptor.receive(new UserSecurityConfiguration().clone(x)));
    model.newServicePermissions = (model.newServicePermissions ?? []).map(x => userSecurityConfigurationInterceptor.receive(new UserSecurityConfiguration().clone(x)));
    return model;
  }

  send(model: Partial<ExternalUserUpdateRequest>): Partial<ExternalUserUpdateRequest> {
    model.customRoleId = CommonUtils.isValidValue(model.customRoleId) ? model.customRoleId : undefined;
    model.oldServicePermissions = (model.oldServicePermissions ?? []).map(item => userSecurityConfigurationInterceptor.send(GeneralInterceptor.send(new UserSecurityConfiguration().clone({...item})))) as UserSecurityConfiguration[];
    model.newServicePermissions = (model.newServicePermissions ?? []).map(item => userSecurityConfigurationInterceptor.send(GeneralInterceptor.send(new UserSecurityConfiguration().clone({...item})))) as UserSecurityConfiguration[];
    ExternalUserUpdateRequestInterceptor._deleteBeforeSend(model);
    return model;
  }

  static _deleteBeforeSend(model: Partial<ExternalUserUpdateRequest> | any): void {
    delete model.service;
    delete model.langService;
    delete model.updatedOnString;
    delete model.requestStatusInfo;
    delete model.requestTypeInfo;
    delete model.statusDateModifiedString;
    delete model.searchFields;
    delete model.customRoleInfo;
    delete model.jobTitleInfo;
    delete model.statusInfo;
    delete model.userTypeInfo;
    delete model.profileInfo;
    delete model.nationalityInfo;
    delete model.updateByInfo;
    delete model.requestSaveType;
    delete model.userPreferences;
  }
}
