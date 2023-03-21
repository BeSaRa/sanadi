import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {InternalUser} from '@models/internal-user';
import {AdminResult} from "@app/models/admin-result";
import {CommonUtils} from '@app/helpers/common-utils';
import {UserPreferences} from '@models/user-preferences';
import {UserPreferencesInterceptor} from '@model-interceptors/user-preferences-interceptor';

const userPreferencesInterceptor = new UserPreferencesInterceptor();

export class InternalUserInterceptor implements IModelInterceptor<InternalUser> {
  send(model: Partial<InternalUser>): Partial<InternalUser> {
    // @ts-ignore
    model.customRoleId = CommonUtils.isValidValue(model.customRoleId) ? model.customRoleId : null;
    model.userPreferences && (model.userPreferences = userPreferencesInterceptor.send(model.userPreferences) as UserPreferences);

    delete model.defaultDepartmentInfo;
    delete model.jobTitleInfo;
    delete model.statusInfo;
    delete model.service;
    delete model.langService;
    delete model.userTypeInfo;
    delete model.generalUserId;
    return model;
  }

  receive(model: InternalUser): InternalUser {
    model.defaultDepartmentInfo = AdminResult.createInstance(model.defaultDepartmentInfo);
    model.jobTitleInfo = AdminResult.createInstance(model.jobTitleInfo);
    model.statusInfo = AdminResult.createInstance(model.statusInfo);
    model.userPreferences && (model.userPreferences = userPreferencesInterceptor.receive(new UserPreferences().clone(model.userPreferences)));
    return model;
  }

}
