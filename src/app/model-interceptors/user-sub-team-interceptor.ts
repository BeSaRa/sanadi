import { UserSubTeam } from './../models/user-sub-team';
import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { AdminResult } from "@app/models/admin-result";

export class UserSubTeamInterceptor implements IModelInterceptor<UserSubTeam> {
  send(model: Partial<UserSubTeam>): Partial<UserSubTeam> {
    delete model.subTeamInfo;
    delete model.arName;
    delete model.enName;
    return model;
  }

  receive(model: UserSubTeam): UserSubTeam {
    model.subTeamInfo = AdminResult.createInstance(model.subTeamInfo);
    model.arName = model.subTeamInfo.arName;
    model.enName = model.subTeamInfo.enName;
    return model;
  }
}
