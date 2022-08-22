import { OrgUser } from '../models/org-user';
import { AdminResult } from '../models/admin-result';
import { DateUtils } from '@helpers/date-utils';
import { CommonUtils } from '@app/helpers/common-utils';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';

export class OrgUserInterceptor implements IModelInterceptor<OrgUser> {
  receive(model: OrgUser | any): (OrgUser | any) {
    model.customRoleInfo = AdminResult.createInstance(model.customRoleInfo)
    model.jobTitleInfo = AdminResult.createInstance(model.jobTitleInfo)
    model.orgBranchInfo = AdminResult.createInstance(model.orgBranchInfo)
    model.orgUnitInfo = AdminResult.createInstance(model.orgUnitInfo)
    model.statusInfo = AdminResult.createInstance(model.statusInfo)
    model.userTypeInfo = AdminResult.createInstance(model.userTypeInfo)
    model.statusDateModifiedString = model.statusDateModified ? DateUtils.getDateStringFromDate(model.statusDateModified, 'DEFAULT_DATE_FORMAT') : '';
    return model;
  }

  send(model: Partial<OrgUser> | any): (OrgUser | any) {
    model.customRoleId = CommonUtils.isValidValue(model.customRoleId) ? model.customRoleId : null;
    OrgUserInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<OrgUser | any>): void {
    delete model.service;
    delete model.langService;
    delete model.lookupService;
    delete model.statusDateModifiedString;
    delete model.searchFields;
    delete model.customRoleInfo;
    delete model.jobTitleInfo;
    delete model.orgBranchInfo;
    delete model.orgUnitInfo;
    delete model.statusInfo;
    delete model.userTypeInfo;
  }
}
