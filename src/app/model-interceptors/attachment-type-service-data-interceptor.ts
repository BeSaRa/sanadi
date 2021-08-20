import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {AttachmentTypeServiceData} from '../models/attachment-type-service-data';

export class AttachmentTypeServiceDataInterceptor implements IModelInterceptor<AttachmentTypeServiceData> {
  receive(model: AttachmentTypeServiceData): AttachmentTypeServiceData {
    return model;
  }

  send(model: Partial<AttachmentTypeServiceData>): Partial<AttachmentTypeServiceData> {
    delete model.langService;
    delete model.service;
    return model;
  }
}
