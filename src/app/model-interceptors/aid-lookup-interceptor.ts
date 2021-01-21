import {AidLookup} from '../models/aid-lookup';
import {FactoryService} from '../services/factory.service';
import {LookupCategories} from '../enums/lookup-categories';
import {LookupService} from '../services/lookup.service';

export function interceptReceiveAidLookup(model: AidLookup | any): (AidLookup | any) {
  const lookupService: LookupService = FactoryService.getService('LookupService');
  model.aidTypeInfo = lookupService.getByLookupKeyAndCategory(model.aidType, LookupCategories.AID_TYPE);

  return model;
}

export function interceptSendAidLookup(model: AidLookup | any): (AidLookup | any) {
  delete model.service;
  delete model.langService;

  return model;
}
