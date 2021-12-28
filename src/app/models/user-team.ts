import {AdminResult} from "./admin-result";
import {Cloneable} from "@app/models/cloneable";
import {Observable} from "rxjs";
import {FactoryService} from "@app/services/factory.service";
import {UserTeamService} from "@app/services/user-team.service";
import {map} from "rxjs/operators";
import {CommonStatusEnum} from '@app/enums/common-status.enum';

export class UserTeam extends Cloneable<UserTeam> {
  id!: number;
  generalUserId!: number;
  teamId!: number;
  teamInfo!: AdminResult;
  status!: number;
  // not related to the model
  arName?: string;
  enName?: string;
  service!: UserTeamService

  constructor() {
    super();
    this.service = FactoryService.getService('UserTeamService');
  }

  denormalize(): UserTeam {
    this.arName = this.teamInfo.arName;
    this.enName = this.teamInfo.enName;
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
