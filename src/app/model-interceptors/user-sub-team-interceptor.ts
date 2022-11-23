import { UserSubTeam } from './../models/user-sub-team';
import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { AdminResult } from "@app/models/admin-result";

export class UserSubTeamInterceptor implements IModelInterceptor<UserSubTeam> {
  send(model: Partial<UserSubTeam>): Partial<UserSubTeam> {
    delete model.subTeamfo;
    delete model.arName;
    delete model.enName;
    console.log(model)
    return model;
  }

  receive(model: UserSubTeam): UserSubTeam {
    model.subTeamfo = AdminResult.createInstance(model.subTeamfo);
    model.arName = model.subTeamfo.arName;
    model.enName = model.subTeamfo.enName;
    return model;
  }
}
