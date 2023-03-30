import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {UserPreferences} from '@models/user-preferences';
import {CommonUtils} from '@helpers/common-utils';

export class UserPreferencesInterceptor implements IModelInterceptor<UserPreferences> {
  send(model: Partial<UserPreferences>): Partial<UserPreferences> {
    UserPreferencesInterceptor.stringifyEmailList(model);

    UserPreferencesInterceptor._deleteBeforeSend(model)
    return model;
  }

  receive(model: UserPreferences): UserPreferences {
    UserPreferencesInterceptor.parseEmailsList(model);
    return model;
  }

  private static parseEmailsList(model: UserPreferences) {
    try {
      model.alternateEmailListParsed = JSON.parse(model.alternateEmailList);
    } catch (e) {
      model.alternateEmailListParsed = [];
    }
  }

  private static stringifyEmailList(model: Partial<UserPreferences>) {
    model.alternateEmailList = JSON.stringify((model.alternateEmailListParsed ?? []).filter((email) => CommonUtils.isValidValue(email)));
  }

  private static _deleteBeforeSend(model: Partial<UserPreferences>): void {
    delete model.langService;
    delete model.service;
    delete model.alternateEmailListParsed;
  }
}
