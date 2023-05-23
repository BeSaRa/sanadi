import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { UserTeam } from "@app/models/user-team";
import { AdminResult } from "@app/models/admin-result";

export class UserTeamInterceptor implements IModelInterceptor<UserTeam> {
  send(model: Partial<UserTeam>): Partial<UserTeam> {
    delete model.teamInfo;
    delete model.arName;
    delete model.enName;
    delete model.langService;
    return model;
  }

  receive(model: UserTeam): UserTeam {
    model.teamInfo = AdminResult.createInstance(model.teamInfo);
    model.arName = model.teamInfo.arName;
    model.enName = model.teamInfo.enName;
    return model;
  }
}
