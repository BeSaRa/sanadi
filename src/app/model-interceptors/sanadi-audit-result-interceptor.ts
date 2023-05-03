import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {SanadiAuditResult} from '@app/models/sanadi-audit-result';
import {AdminResult} from '@app/models/admin-result';
import {isValidAdminResult} from '@app/helpers/utils';
import {DateUtils} from '@app/helpers/date-utils';

export class SanadiAuditResultInterceptor implements IModelInterceptor<SanadiAuditResult>{
  receive(model: SanadiAuditResult): SanadiAuditResult {
    model.operationInfo = AdminResult.createInstance(isValidAdminResult(model.operationInfo) ? model.operationInfo : {});
    model.orgInfo = AdminResult.createInstance(isValidAdminResult(model.orgInfo) ? model.orgInfo : {});
    model.userInfo = AdminResult.createInstance(isValidAdminResult(model.userInfo) ? model.userInfo : {});
    model.statusInfo = AdminResult.createInstance(isValidAdminResult(model.statusInfo) ? model.statusInfo : {});
    model.statusDateModifiedString = model.statusDateModified ? DateUtils.getDateStringFromDate(model.statusDateModified, 'DEFAULT_DATE_FORMAT') : '';
    model.updatedOnString = model.updatedOn ? DateUtils.getDateStringFromDate(model.updatedOn, 'TIMESTAMP') : '';
    return model;
  }

  send(model: Partial<SanadiAuditResult>): Partial<SanadiAuditResult> {
    SanadiAuditResultInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<SanadiAuditResult>): void {
    delete model.auditEntity;
    delete model.subventionAidService;
    delete model.subventionRequestService;
    delete model.beneficiaryService;
    delete model.statusDateModifiedString;
    delete model.updatedOnString;
  }
}
