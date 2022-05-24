import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {Bank} from '@app/models/bank';
import {FactoryService} from '@app/services/factory.service';
import {LookupService} from '@app/services/lookup.service';

export class BankInterceptor implements IModelInterceptor<Bank> {
  send(model: Partial<Bank>): Partial<Bank> {
    model.status = model.status ? 1 : 0;
    delete model.langService;
    delete model.service;
    delete model.statusInfo;
    return model;
  }

  receive(model: Bank): Bank {
    const lookupService = FactoryService.getService('LookupService') as LookupService;
    model.statusInfo = (lookupService.listByCategory.CommonStatus.find(s => s.lookupKey == model.status)!);
    return model;
  }
}
