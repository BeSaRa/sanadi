import { AdminResult } from '@app/models/admin-result';
import { LangService } from './../services/lang.service';
import { INames } from './../interfaces/i-names';
import { UserSubTeamService } from './../services/user-sub-team.service';
import { Cloneable } from "@app/models/cloneable";
import { Observable } from "rxjs";
import { FactoryService } from "@app/services/factory.service";
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
  status!: number;
  subTeamInfo!: AdminResult;
  // not related to the model
  arName?: string;
  enName?: string;
  service!: UserSubTeamService
  langService!: LangService;

  constructor() {
    super();
    this.service = FactoryService.getService('UserSubTeamService');
    this.langService = FactoryService.getService('LangService');
  }

  denormalize(): UserSubTeam {
    this.arName = this.subTeamInfo.arName;
    this.enName = this.subTeamInfo.enName;
    return this;
  }
  getName(): string | undefined {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
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
