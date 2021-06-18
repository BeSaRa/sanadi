import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {AttachmentType} from '../models/attachment-type';

export class AttachmentTypeInterceptor implements IModelInterceptor<AttachmentType>{
  receive(model: AttachmentType): AttachmentType {
    return model;
  }

  send(model: Partial<AttachmentType>): Partial<AttachmentType> {
    delete model.langService;
    delete model.service;
    return model;
  }
}
