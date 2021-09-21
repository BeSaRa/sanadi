import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {DacOcha} from '@app/models/dac-ocha';
import {FactoryService} from '@app/services/factory.service';
import {LookupService} from '@app/services/lookup.service';

export class DacOchaInterceptor implements IModelInterceptor<DacOcha>{
  receive(model: DacOcha): DacOcha {
    const lookupService = FactoryService.getService('LookupService') as LookupService;
    model.statusInfo = (lookupService.listByCategory.CommonStatus.find(s => s.lookupKey == model.status)!);
    return model;
  }

  send(model: Partial<DacOcha>): Partial<DacOcha> {
    delete model.statusInfo;
    delete model.service;
    delete model.langService;
    return model;
  }
}
