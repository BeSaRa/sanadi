import {getDateStringFromDate} from '../helpers/utils';
import {AdminResult} from '../models/admin-result';

export class SanadiAttachmentInterceptor {
  static receive(model: any): any {
    model.lastModifiedString = getDateStringFromDate(model.lastModified);
    model.attachmentTypeInfo = AdminResult.createInstance(model.attachmentTypeInfo);
    return model;
  }

  static send(model: any): any {
    delete model.attachmentService;
    delete model.lastModifiedString;
    delete model.attachmentTypeInfo;
    return model;
  }
}
