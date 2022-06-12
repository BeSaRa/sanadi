import {AidLookup} from '../models/aid-lookup';
import {FactoryService} from '@services/factory.service';
import {LookupService} from '@services/lookup.service';
import {DateUtils} from '@helpers/date-utils';
import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {Lookup} from '@app/models/lookup';

export class AidLookupInterceptor implements IModelInterceptor<AidLookup> {
  receive(model: AidLookup | any): (AidLookup | any) {
    const lookupService: LookupService = FactoryService.getService('LookupService');
    model.aidTypeInfo = model.aidTypeInfo ? new Lookup().clone(model.aidTypeInfo) : lookupService.findLookupByLookupKey(lookupService.listByCategory.AidType, model.aidType);
    model.statusInfo =  model.statusInfo ? new Lookup().clone(model.statusInfo) : lookupService.findLookupByLookupKey(lookupService.listByCategory.AidLookupStatus, model.status);
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
    delete model.aidTypeInfo;
    delete model.parentInfo;
    delete model.searchFields;
    delete model.statusDateModifiedString;
  }
}
