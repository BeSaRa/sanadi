import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {FileNetDocument} from '../models/file-net-document';
import {AdminResult} from '../models/admin-result';

export class FileNetDocumentInterceptor implements IModelInterceptor<FileNetDocument> {
  receive(model: FileNetDocument): FileNetDocument {
    model.creatorInfo = AdminResult.createInstance(model.creatorInfo);
    model.ouInfo = AdminResult.createInstance(model.ouInfo);
    return model;
  }

  send(model: Partial<FileNetDocument>): any {
    delete model.dialog;
    delete model.searchFields;
    return model;
  }
}
