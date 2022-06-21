import {Localization} from '../models/localization';

export class LocalizationInterceptor {
  static receive(model: Localization | any): (Localization | any) {
    return model;
  }

  static send(model: Localization | any): (Localization | any) {
    delete model.service;
    delete model.searchFields;
    return model;
  }
}
