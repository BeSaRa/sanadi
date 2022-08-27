import { generateModelAndCast, isValidAdminResult } from '@helpers/utils';
import { AdminResult } from '../models/admin-result';
import { OrgUserPermission } from '../models/org-user-permission';
import { IModelInterceptor } from "@contracts/i-model-interceptor";

export class OrgUserPermissionInterceptor implements IModelInterceptor<OrgUserPermission> {
  send(model: Partial<OrgUserPermission>): Partial<OrgUserPermission> {
    model.permisionInfo = isValidAdminResult(model.permisionInfo)
      ? generateModelAndCast(AdminResult, model.permisionInfo)
      : model.permisionInfo;
    return model;
  }

  receive(model: OrgUserPermission): OrgUserPermission {
    return model
  }
}
