import {IModelInterceptor} from "@contracts/i-model-interceptor";
import {FollowupPermission} from "@app/models/followup-permission";
import {AdminResult} from '@models/admin-result';

export class FollowupPermissionInterceptor implements IModelInterceptor<FollowupPermission> {
  caseInterceptor?: IModelInterceptor<FollowupPermission> | undefined;

  send(model: Partial<FollowupPermission>): Partial<FollowupPermission> {
    FollowupPermissionInterceptor._deleteBeforeSend(model);
    return model;
  }

  receive(model: FollowupPermission): FollowupPermission {
    model.teamInfo = AdminResult.createInstance(model.teamInfo);
    model.arName = model.teamInfo.arName;
    model.enName = model.teamInfo.enName;
    return model;
  }

  private static _deleteBeforeSend(model: Partial<FollowupPermission>): void {
    delete model.arName
    delete model.enName
    delete model.service
    delete model.teamInfo
    delete model.updatedOn
    delete model.searchFields
  }
}
