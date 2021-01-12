import {Localization} from '../models/localization';

export function interceptLocalization(model: Localization | any) {
  delete model.service;
  return model;
}
