import { IModelInterceptor } from "@contracts/i-model-interceptor";
import { FollowupPermission } from "@app/models/followup-permission";

export class FollowupPermissionInterceptor implements IModelInterceptor<FollowupPermission> {
  caseInterceptor?: IModelInterceptor<FollowupPermission> | undefined;

  send(model: Partial<FollowupPermission>): Partial<FollowupPermission> {
    delete model.arName
    delete model.enName
    delete model.service
    delete model.teamInfo
    delete model.updatedOn
    return model
  }

  receive(model: FollowupPermission): FollowupPermission {
    return model
  }
}
