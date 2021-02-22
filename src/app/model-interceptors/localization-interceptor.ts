import {Localization} from '../models/localization';

export function interceptLocalization(model: Localization | any) {
  delete model.service;
  delete model.searchFields;
  return model;
}
