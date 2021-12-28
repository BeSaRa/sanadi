import {OrgUser} from '../models/org-user';
import {generateModelAndCast, isValidAdminResult} from '../helpers/utils';
import {AdminResult} from '../models/admin-result';
import {DateUtils} from '../helpers/date-utils';
import {CommonUtils} from '@app/helpers/common-utils';

export class OrgUserInterceptor {
  static receive(model: OrgUser | any): (OrgUser | any) {
    model.customRoleInfo = isValidAdminResult(model.customRoleInfo) ? generateModelAndCast(AdminResult, model.customRoleInfo) : model.customRoleInfo;
    model.jobTitleInfo = isValidAdminResult(model.jobTitleInfo) ? generateModelAndCast(AdminResult, model.jobTitleInfo) : model.jobTitleInfo;
    model.orgBranchInfo = isValidAdminResult(model.orgBranchInfo) ? generateModelAndCast(AdminResult, model.orgBranchInfo) : model.orgBranchInfo;
    model.orgUnitInfo = isValidAdminResult(model.orgUnitInfo) ? generateModelAndCast(AdminResult, model.orgUnitInfo) : model.orgUnitInfo;
    model.statusInfo = isValidAdminResult(model.statusInfo) ? generateModelAndCast(AdminResult, model.statusInfo) : model.statusInfo;
    model.userTypeInfo = isValidAdminResult(model.userTypeInfo) ? generateModelAndCast(AdminResult, model.userTypeInfo) : model.userTypeInfo;
    model.statusDateModifiedString = model.statusDateModified ? DateUtils.getDateStringFromDate(model.statusDateModified, 'DEFAULT_DATE_FORMAT') : '';
    return model;
  }

  static send(model: OrgUser | any): (OrgUser | any) {
    model.customRoleId = CommonUtils.isValidValue(model.customRoleId) ? model.customRoleId : null;
    delete model.service;
    delete model.langService;
    delete model.lookupService;
    delete model.statusDateModifiedString;
    delete model.searchFields;
    return model;
  }
}
