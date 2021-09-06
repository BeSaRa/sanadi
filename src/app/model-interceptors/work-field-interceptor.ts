import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {WorkField} from '@app/models/work-field';
import {FactoryService} from '@app/services/factory.service';
import {LookupService} from '@app/services/lookup.service';

export class WorkFieldInterceptor implements IModelInterceptor<WorkField>{
  receive(model: WorkField): WorkField {
    const lookupService = FactoryService.getService('LookupService') as LookupService;
    model.statusInfo = (lookupService.listByCategory.CommonStatus.find(s => s.lookupKey == model.status)!);
    return model;
  }

  send(model: Partial<WorkField>): Partial<WorkField> {
    delete model.statusInfo;
    delete model.service;
    delete model.langService;
    return model;
  }
}
