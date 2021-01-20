import {AidLookup} from '../models/aid-lookup';
import {FactoryService} from '../services/factory.service';
import {LookupCategories} from '../enums/lookup-categories';

export function interceptReceiveAidLookup(model: AidLookup | any) {
  const lookupService = FactoryService.getService('LookupService');
  model.aidTypeInfo = lookupService.getLookupByCategoryAndId(LookupCategories.AID_TYPE, model.aidType);

  return model;
}

export function interceptSendAidLookup(model: AidLookup | any) {
  delete model.service;
  delete model.langService;

  return model;
}
