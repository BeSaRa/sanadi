import { AdminResult } from "./admin-result";
import { Cloneable } from "@app/models/cloneable";
import { Observable } from "rxjs";
import { FactoryService } from "@app/services/factory.service";
import { UserTeamService } from "@app/services/user-team.service";
import { map } from "rxjs/operators";
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { InterceptModel } from "@decorators/intercept-model";
import { UserSubTeamInterceptor } from "@app/model-interceptors/user-sub-team-interceptor";

const interceptor = new UserSubTeamInterceptor()

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})
export class UserSubTeam extends Cloneable<UserSubTeam> {
  id!: number;
  generalUserId!: number;
  subTeamId!: number;
  subTeamfo!: AdminResult;
  status!: number;
  // not related to the model
  arName?: string;
  enName?: string;
  service!: UserTeamService

  constructor() {
    super();
    this.service = FactoryService.getService('UserTeamService');
  }

  denormalize(): UserSubTeam {
    this.arName = this.subTeamfo.arName;
    this.enName = this.subTeamfo.enName;
    return this;
  }

  isActive(): boolean {
    return Number(this.status) === CommonStatusEnum.ACTIVATED;
  }

  toggleStatus(): Observable<boolean> {
    return this.status ? this.deactivate() : this.activate();
  }

  activate(): Observable<boolean> {
    return this.service.activate([this.id]).pipe(map(i => i[this.id]));
  }

  deactivate(): Observable<boolean> {
    return this.service.deactivate([this.id]).pipe(map(i => i[this.id]));
  }

  delete(): Observable<boolean> {
    return this.service.deleteBulk([this.id]).pipe(map(i => i[this.id]));
  }
}
