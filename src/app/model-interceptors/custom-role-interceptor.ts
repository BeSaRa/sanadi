import {FactoryService} from '@app/services/factory.service';
import {LookupService} from '@app/services/lookup.service';

export class CustomRoleInterceptor {
  static receive(model: any): any {
    const lookupService = FactoryService.getService('LookupService') as LookupService;
    model.statusInfo = (lookupService.listByCategory.CommonStatus.find(s => s.lookupKey == model.status)!);
    return model;
  }

  static send(model: any): any {
    delete model.service;
    delete model.langService;
    delete model.searchFields;
    delete model.statusInfo;
    return model
  }
}
