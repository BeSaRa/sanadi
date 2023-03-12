import {AuditLog} from '../models/audit-log';
import {AdminResult} from '../models/admin-result';
import {DateUtils} from '@helpers/date-utils';
import {IModelInterceptor} from '@contracts/i-model-interceptor';

export class AuditLogInterceptor implements IModelInterceptor<AuditLog>{
  receive(model: AuditLog): AuditLog {
    model.orgInfo = AdminResult.createInstance(model.orgInfo);
    model.orgUserInfo = AdminResult.createInstance(model.orgUserInfo);
    model.operationInfo = AdminResult.createInstance(model.operationInfo);
    model.statusInfo = AdminResult.createInstance(model.statusInfo);
    model.statusDateModifiedString = DateUtils.getDateStringFromDate(model.statusDateModified);
    model.updatedOnString = DateUtils.getDateStringFromDate(model.updatedOn);
    return model;
  }

  send(model: Partial<AuditLog>): Partial<AuditLog> {
    delete model.statusDateModifiedString;
    delete model.updatedOnString;
    delete model.searchFields;
    return model;
  }
}
