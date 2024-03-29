import { BaseModel } from "@app/models/base-model";
import { UserSecurityConfigurationService } from "@app/services/user-security-configuration.service";
import { FactoryService } from "@app/services/factory.service";
import { AdminResult } from "@app/models/admin-result";
import { UserSecurityConfigurationInterceptor } from "@app/model-interceptors/user-security-configuration-interceptor";
import { InterceptModel } from "@decorators/intercept-model";

const { receive, send } = new UserSecurityConfigurationInterceptor()

@InterceptModel({
  receive, send
})
export class UserSecurityConfiguration extends BaseModel<UserSecurityConfiguration, UserSecurityConfigurationService> {
  writeOnly!: true
  serviceId!: number
  caseType!: number
  teamId!: number
  canAdd!: boolean;
  canView!: boolean;
  canManage!: boolean;
  generalUserId!: number
  approval!: boolean
  followUp!: boolean;

  teamInfo!: AdminResult;
  serviceInfo!: AdminResult;
  generalUserInfo!: AdminResult;
  service!: UserSecurityConfigurationService;

  constructor() {
    super();
    this.service = FactoryService.getService('UserSecurityConfigurationService');
  }
}
