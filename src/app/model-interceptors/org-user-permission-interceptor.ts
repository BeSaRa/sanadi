import {generateModelAndCast, isValidAdminResult} from '../helpers/utils';
import {AdminResult} from '../models/admin-result';
import {OrgUserPermission} from '../models/org-user-permission';

export function interceptReceiveOrgUserPermission(model: OrgUserPermission | any): (OrgUserPermission | any) {
  model.permisionInfo = isValidAdminResult(model.permisionInfo)
    ? generateModelAndCast(AdminResult, model.permisionInfo)
    : model.permisionInfo;
  return model;
}
