import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {UserPreferences} from '@models/user-preferences';

export class UserPreferencesInterceptor implements IModelInterceptor<UserPreferences> {
  caseInterceptor?: IModelInterceptor<UserPreferences> | undefined;

  send(model: Partial<UserPreferences>): Partial<UserPreferences> {
    delete model.langService;
    delete model.service;
    return model;
  }

  receive(model: UserPreferences): UserPreferences {
    return model;
  }
}
