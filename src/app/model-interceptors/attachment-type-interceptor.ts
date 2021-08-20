import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {AttachmentType} from '../models/attachment-type';
import {LookupService} from '../services/lookup.service';
import {FactoryService} from '../services/factory.service';

export class AttachmentTypeInterceptor implements IModelInterceptor<AttachmentType> {
  receive(model: AttachmentType): AttachmentType {
    const lookupService = FactoryService.getService('LookupService') as LookupService;
    model.statusInfo = (lookupService.listByCategory.CommonStatus.find(s => s.lookupKey == model.status)!);
    return model;
  }

  send(model: Partial<AttachmentType>): Partial<AttachmentType> {
    delete model.langService;
    delete model.service;
    delete model.statusInfo;
    return model;
  }
}
