import {BaseModel} from "@app/models/base-model";
import {TeamSecurityConfigurationService} from "@app/services/team-security-configuration.service";
import {FactoryService} from "@app/services/factory.service";
import {AdminResult} from "@app/models/admin-result";
import {UserSecurityConfiguration} from "@app/models/user-security-configuration";

export class TeamSecurityConfiguration extends BaseModel<TeamSecurityConfiguration, TeamSecurityConfigurationService> {
  serviceId!: number;
  caseType!: number;
  teamId!: number;
  canAdd: boolean = false;
  canView: boolean = false;
  canManage: boolean = false;
  writeOnly!: boolean;
  approval!: boolean;
  service: TeamSecurityConfigurationService;
  serviceInfo!: AdminResult;
  teamInfo!: AdminResult;

  constructor() {
    super();
    this.service = FactoryService.getService('TeamSecurityConfigurationService');
  }

  convertToUserSecurity(generalUserId: number): Partial<UserSecurityConfiguration> {
    const {teamId, caseType, serviceId} = this;
    return {
      teamId,
      caseType,
      serviceId,
      canAdd: false,
      canManage: false,
      canView: false,
      generalUserId
    }
  }
}
