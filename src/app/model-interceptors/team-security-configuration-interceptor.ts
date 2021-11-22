import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {TeamSecurityConfiguration} from "@app/models/team-security-configuration";
import {AdminResult} from "@app/models/admin-result";

export class TeamSecurityConfigurationInterceptor implements IModelInterceptor<TeamSecurityConfiguration> {
  send(model: Partial<TeamSecurityConfiguration>): Partial<TeamSecurityConfiguration> {
    return model;
  }

  receive(model: TeamSecurityConfiguration): TeamSecurityConfiguration {
    model.serviceInfo = AdminResult.createInstance(model.serviceInfo)
    model.teamInfo = AdminResult.createInstance(model.teamInfo)
    return model;
  }
}
