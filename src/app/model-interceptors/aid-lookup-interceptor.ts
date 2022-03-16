import {AidLookup} from '../models/aid-lookup';
import {FactoryService} from '../services/factory.service';
import {LookupCategories} from '../enums/lookup-categories';
import {LookupService} from '../services/lookup.service';
import {DateUtils} from '../helpers/date-utils';
import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';

export class AidLookupInterceptor implements IModelInterceptor<AidLookup> {
  receive(model: AidLookup | any): (AidLookup | any) {
    const lookupService: LookupService = FactoryService.getService('LookupService');
    model.aidTypeInfo = lookupService.getByLookupKeyAndCategory(model.aidType, LookupCategories.AID_TYPE);
    model.statusInfo = lookupService.getByLookupKeyAndCategoryId(model.status, LookupCategories.AID_LOOKUP_STATUS_CAT_ID);
    model.statusDateModifiedString = model.statusDateModified ? DateUtils.getDateStringFromDate(model.statusDateModified, 'DEFAULT_DATE_FORMAT') : '';
    return model;
  }

  send(model: AidLookup | any): (AidLookup | any) {
    AidLookupInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<AidLookup> | any): void {
    delete model.service;
    delete model.langService;
    delete model.statusInfo;
    delete model.aidTypeInfo; // removed because it has private services or properties which need to removed. better to remove entire object
    delete model.parentInfo;
    delete model.searchFields;
    delete model.statusDateModifiedString;
  }
}
