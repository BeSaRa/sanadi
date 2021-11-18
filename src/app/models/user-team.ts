import {AdminResult} from "./admin-result";
import {Cloneable} from "@app/models/cloneable";

export class UserTeam extends Cloneable<UserTeam> {
  id!: number;
  generalUserId!: number;
  teamId!: number;
  teamInfo!: AdminResult;
  status!: boolean;
  // not related to the model
  arName?: string;
  enName?: string;

  denormalize(): UserTeam {
    this.arName = this.teamInfo.arName;
    this.enName = this.teamInfo.enName;
    return this;
  }
}
