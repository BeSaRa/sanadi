import {OrgUser} from '../models/org-user';
import {generateModelAndCast, isValidAdminResult} from '../helpers/utils';
import {AdminResult} from '../models/admin-result';

export function interceptOrganizationUser(model: OrgUser | any): (OrgUser | any) {
  delete model.service;
  delete model.langService;

  return model;
}

export function interceptReceiveOrganizationUser(model: OrgUser | any): (OrgUser | any) {
  model.customRoleInfo = isValidAdminResult(model.customRoleInfo) ? generateModelAndCast(AdminResult, model.customRoleInfo) : model.customRoleInfo;
  model.jobTitleInfo = isValidAdminResult(model.jobTitleInfo) ? generateModelAndCast(AdminResult, model.jobTitleInfo) : model.jobTitleInfo;
  model.orgBranchInfo = isValidAdminResult(model.orgBranchInfo) ? generateModelAndCast(AdminResult, model.orgBranchInfo) : model.orgBranchInfo;
  model.orgUnitInfo = isValidAdminResult(model.orgUnitInfo) ? generateModelAndCast(AdminResult, model.orgUnitInfo) : model.orgUnitInfo;
  model.statusInfo = isValidAdminResult(model.statusInfo) ? generateModelAndCast(AdminResult, model.statusInfo) : model.statusInfo;
  model.userTypeInfo = isValidAdminResult(model.userTypeInfo) ? generateModelAndCast(AdminResult, model.userTypeInfo) : model.userTypeInfo;
  return model;
}
