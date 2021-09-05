import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {JobTitle} from '@app/models/job-title';
import {FactoryService} from '@app/services/factory.service';
import {LookupService} from '@app/services/lookup.service';

export class JobTitleInterceptor implements IModelInterceptor<JobTitle>{
  receive(model: JobTitle): JobTitle {
    const lookupService = FactoryService.getService('LookupService') as LookupService;
    model.statusInfo = (lookupService.listByCategory.CommonStatus.find(s => s.lookupKey == model.status)!);
    return model;
  }

  send(model: Partial<JobTitle>): Partial<JobTitle> {
    delete model.statusInfo;
    delete model.service;
    delete model.langService;
    return model;
  }
}
