import {AidLookup} from '../models/aid-lookup';
import {FactoryService} from '../services/factory.service';
import {LookupCategories} from '../enums/lookup-categories';
import {LookupService} from '../services/lookup.service';

export function interceptReceiveAidLookup(model: AidLookup | any): (AidLookup | any) {
  const lookupService: LookupService = FactoryService.getService('LookupService');
  model.aidTypeInfo = lookupService.getByLookupKeyAndCategory(model.aidType, LookupCategories.AID_TYPE);
  model.statusInfo = lookupService.getByLookupKeyAndCategoryId(model.status,  LookupCategories.AID_LOOKUP_STATUS_CAT_ID);
  return model;
}

export function interceptSendAidLookup(model: AidLookup | any): (AidLookup | any) {
  delete model.service;
  delete model.langService;
  delete model.statusInfo;
  delete model.aidTypeInfo; // removed because it has private services or properties which need to removed. better to remove entire object
  delete model.parentInfo;
  return model;
}
