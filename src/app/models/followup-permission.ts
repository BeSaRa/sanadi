import { AdminResult } from "@app/models/admin-result";
import { BaseModel } from "@app/models/base-model";
import { FollowupPermissionService } from "@services/followup-permission.service";
import { FactoryService } from "@services/factory.service";
import { InterceptModel } from "@decorators/intercept-model";
import { FollowupPermissionInterceptor } from "@app/model-interceptors/followup-permission-interceptor";

const interceptor = new FollowupPermissionInterceptor()

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive
})
export class FollowupPermission extends BaseModel<FollowupPermission, FollowupPermissionService> {
  service: FollowupPermissionService;
  id!: number;
  generalUserId!: number;
  teamId!: number;
  teamInfo!: AdminResult;
  hasInternal!: boolean;
  hasExternal!: boolean;

  constructor() {
    super();
    this.service = FactoryService.getService('FollowupPermissionService');
  }

  toggleProperty(property: 'hasInternal' | 'hasExternal'): FollowupPermission {
    this[property] = !this[property]
    return this
  }
}
