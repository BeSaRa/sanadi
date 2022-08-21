import { AdminResult } from '../models/admin-result';
import { DateUtils } from '@helpers/date-utils';

export class SanadiAttachmentInterceptor {
  receive(model: any): any {
    model.lastModifiedString = DateUtils.getDateStringFromDate(model.lastModified);
    model.attachmentTypeInfo = AdminResult.createInstance(model.attachmentTypeInfo);
    return model;
  }

  send(model: any): any {
    delete model.attachmentService;
    delete model.lastModifiedString;
    delete model.attachmentTypeInfo;
    delete model.searchFields;
    return model;
  }
}
