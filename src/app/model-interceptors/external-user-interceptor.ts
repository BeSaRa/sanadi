import {ExternalUser} from '@models/external-user';
import {AdminResult} from '@models/admin-result';
import {DateUtils} from '@helpers/date-utils';
import {CommonUtils} from '@app/helpers/common-utils';
import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {UserPreferencesInterceptor} from '@model-interceptors/user-preferences-interceptor';
import {UserPreferences} from '@models/user-preferences';

const userPreferencesInterceptor = new UserPreferencesInterceptor();

export class ExternalUserInterceptor implements IModelInterceptor<ExternalUser> {
  receive(model: ExternalUser | any): (ExternalUser | any) {
    model.customRoleInfo = AdminResult.createInstance(model.customRoleInfo)
    model.jobTitleInfo && (model.jobTitleInfo = AdminResult.createInstance(model.jobTitleInfo));
    model.statusInfo = AdminResult.createInstance(model.statusInfo)
    model.userTypeInfo = AdminResult.createInstance(model.userTypeInfo)
    model.profileInfo = AdminResult.createInstance(model.profileInfo)
    model.nationalityInfo = AdminResult.createInstance(model.nationalityInfo)
    model.statusDateModifiedString = DateUtils.getDateStringFromDate(model.statusDateModified, 'DEFAULT_DATE_FORMAT');
    model.userPreferences && (model.userPreferences = userPreferencesInterceptor.receive(new UserPreferences().clone(model.userPreferences)));
    return model;
  }

  send(model: Partial<ExternalUser> | any): (ExternalUser | any) {
    model.customRoleId = CommonUtils.isValidValue(model.customRoleId) ? model.customRoleId : null;
    model.userPreferences && (model.userPreferences = userPreferencesInterceptor.send(model.userPreferences));
    ExternalUserInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<ExternalUser> | any): void {
    delete model.service;
    delete model.langService;
    // delete model.lookupService;
    delete model.statusDateModifiedString;
    delete model.searchFields;
    delete model.customRoleInfo;
    delete model.jobTitleInfo;
    delete model.statusInfo;
    delete model.userTypeInfo;
    delete model.profileInfo;
    delete model.nationalityInfo;
  }
}
