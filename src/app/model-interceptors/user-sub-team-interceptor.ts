import { UserSubTeam } from './../models/user-sub-team';
import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { AdminResult } from "@app/models/admin-result";

export class UserSubTeamInterceptor implements IModelInterceptor<UserSubTeam> {
  send(model: Partial<UserSubTeam>): Partial<UserSubTeam> {
    return model;
  }

  receive(model: UserSubTeam): UserSubTeam {
    return model;
  }
}
