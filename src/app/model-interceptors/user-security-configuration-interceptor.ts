import {UserSecurityConfiguration} from "@app/models/user-security-configuration";
import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {AdminResult} from "@app/models/admin-result";

export class UserSecurityConfigurationInterceptor implements IModelInterceptor<UserSecurityConfiguration> {
  send(model: Partial<UserSecurityConfiguration>): Partial<UserSecurityConfiguration> {
    delete model.teamInfo
    delete model.serviceInfo
    delete model.generalUserInfo
    return model;
  }

  receive(model: UserSecurityConfiguration): UserSecurityConfiguration {
    model.teamInfo = AdminResult.createInstance(model.teamInfo);
    model.serviceInfo = AdminResult.createInstance(model.serviceInfo);
    model.generalUserInfo = AdminResult.createInstance(model.generalUserInfo);
    return model;
  }

}
