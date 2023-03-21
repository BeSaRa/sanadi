import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {UserPreferences} from '@models/user-preferences';

export class UserPreferencesInterceptor implements IModelInterceptor<UserPreferences> {
  send(model: Partial<UserPreferences>): Partial<UserPreferences> {
    delete model.langService;
    delete model.service;
    delete model.searchFields;
    return model;
  }

  receive(model: UserPreferences): UserPreferences {
    return model;
  }
}
