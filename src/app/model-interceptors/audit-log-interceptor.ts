import {AuditLog} from '../models/audit-log';
import {AdminResult} from '../models/admin-result';
import {getDateStringFromDate} from '../helpers/utils-date';

export class AuditLogInterceptor {

  static receive(model: AuditLog): AuditLog {
    model.orgInfo = AdminResult.createInstance(model.orgInfo);
    model.orgBranchInfo = AdminResult.createInstance(model.orgBranchInfo);
    model.orgUserInfo = AdminResult.createInstance(model.orgUserInfo);
    model.operationInfo = AdminResult.createInstance(model.operationInfo);
    model.statusInfo = AdminResult.createInstance(model.statusInfo);
    model.statusDateModifiedString = getDateStringFromDate(model.statusDateModified);
    return model;
  }

  static send(model: any): any {
    delete model.statusDateModifiedString;
    return model;
  }
}
