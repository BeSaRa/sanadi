import { IModelInterceptor } from '@contracts/i-model-interceptor';
import { AttachmentTypeServiceData } from '../models/attachment-type-service-data';
import { AdminResult } from "@app/models/admin-result";
import { AttachmentType } from "@app/models/attachment-type";

export class AttachmentTypeServiceDataInterceptor implements IModelInterceptor<AttachmentTypeServiceData> {
  receive(model: AttachmentTypeServiceData): AttachmentTypeServiceData {
    model.serviceInfo = AdminResult.createInstance(model.serviceInfo);
    model.userTypeInfo && (model.userTypeInfo = AdminResult.createInstance(model.userTypeInfo));
    model.attachmentTypeInfo = (new AttachmentType()).clone(model.attachmentTypeInfo);
    model.parsedCustomProperties = model.customProperties ? JSON.parse(model.customProperties) : undefined
    return model;
  }

  send(model: Partial<AttachmentTypeServiceData>): Partial<AttachmentTypeServiceData> {
    delete model.searchFields;
    delete model.langService;
    delete model.service;
    delete model.lookupService;
    delete model.serviceInfo;
    delete model.userTypeInfo;
    delete model.attachmentTypeInfo;
    return model;
  }
}
