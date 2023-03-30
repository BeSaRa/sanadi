import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {FileNetDocument} from '@models/file-net-document';
import {AdminResult} from '@models/admin-result';

export class FileNetDocumentInterceptor implements IModelInterceptor<FileNetDocument> {
  receive(model: FileNetDocument): FileNetDocument {
    model.creatorInfo = AdminResult.createInstance(model.creatorInfo);
    model.ouInfo = AdminResult.createInstance(model.ouInfo);
    model.attachmentTypeInfo = AdminResult.createInstance(model.attachmentTypeInfo);
    model.normalizeItemId()
    return model;
  }

  send(model: Partial<FileNetDocument>): any {
    delete model.dialog;
    delete model.searchFields;
    delete model.attachmentTypeInfo;
    delete model.employeeService;
    delete model.attachmentTypeStatus;
    delete model.employeeService;
    return model;
  }
}
