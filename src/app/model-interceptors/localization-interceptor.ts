import {Localization} from '../models/localization';
import {AdminResult} from '../models/admin-result';

export class LocalizationInterceptor {
  static receive(model: Localization | any): (Localization | any) {
    model.adminResult = AdminResult.createInstance({
      id: 1,
      arName: 'Ahmed Mostafa',
      enName: 'Ahmed Mostafa',
    });
    return model;
  }

  static send(model: Localization | any): (Localization | any) {
    delete model.service;
    delete model.searchFields;
    return model;
  }
}
