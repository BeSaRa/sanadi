import {BaseModel} from "@app/models/base-model";
import {UserSecurityConfigurationService} from "@app/services/user-security-configuration.service";
import {FactoryService} from "@app/services/factory.service";
import {AdminResult} from "@app/models/admin-result";

export class UserSecurityConfiguration extends BaseModel<UserSecurityConfiguration, UserSecurityConfigurationService> {
  writeOnly!: true
  serviceId!: number
  caseType!: number
  teamId!: number
  canAdd!: boolean;
  canView!: boolean;
  canManage!: boolean;
  generalUserId!: number
  approval!: string

  teamInfo!: AdminResult;
  serviceInfo!: AdminResult;
  generalUserInfo!: AdminResult;
  service!: UserSecurityConfigurationService;

  constructor() {
    super();
    this.service = FactoryService.getService('UserSecurityConfigurationService');
  }
}
