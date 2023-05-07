import {Localization} from '@models/localization';
import {IModelInterceptor} from "@contracts/i-model-interceptor";

export class LocalizationInterceptor implements IModelInterceptor<Localization> {
  receive(model: Localization): Localization {
    return model;
  }

  send(model: Partial<Localization>): Partial<Localization> {
    delete model.service;
    delete model.searchFields;
    return model;
  }
}
