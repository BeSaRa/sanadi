import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {AttachmentTypeServiceData} from '../models/attachment-type-service-data';
import {AdminResult} from "@app/models/admin-result";

export class AttachmentTypeServiceDataInterceptor implements IModelInterceptor<AttachmentTypeServiceData> {
  receive(model: AttachmentTypeServiceData): AttachmentTypeServiceData {
    model.serviceInfo = AdminResult.createInstance(model.serviceInfo);
    return model;
  }

  send(model: Partial<AttachmentTypeServiceData>): Partial<AttachmentTypeServiceData> {
    delete model.langService;
    delete model.service;
    delete model.serviceInfo;
    return model;
  }
}
