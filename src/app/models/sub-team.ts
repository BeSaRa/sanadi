import { SubTeamInterceptor } from './../model-interceptors/sub-team-interceptor';
import { AdminResult } from '@app/models/admin-result';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { SubTeamService } from './../services/sub-team.service';
import { BaseModel } from '@app/models/base-model';
import { FactoryService } from '@app/services/factory.service';
import { LangService } from '@app/services/lang.service';
import { INames } from '@app/interfaces/i-names';
import { Lookup } from '@app/models/lookup';
import { searchFunctionType } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { InterceptModel } from "@decorators/intercept-model";

const interceptor: SubTeamInterceptor = new SubTeamInterceptor()

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})
export class SubTeam extends BaseModel<SubTeam, SubTeamService> {
  arName!: string;
  enName!: string;
  parent!: number;
  status: number = CommonStatusEnum.ACTIVATED;
  statusInfo!: Lookup;
  parentInfo!: AdminResult;
  // extra properties
  service!: SubTeamService;
  langService: LangService;
  searchFields: { [key: string]: searchFunctionType | string } = {
    arName: 'arName',
    enName: 'enName',
    status: text => !this.statusInfo ? false : this.statusInfo.getName().toLowerCase().indexOf(text) !== -1,
  };

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
    this.service = FactoryService.getService('SubTeamService')
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  updateStatus(newStatus: CommonStatusEnum): any {
    return this.service.updateStatus(this.id, newStatus);
  }
  buildForm(controls?: boolean): any {
    const {
      arName,
      enName,
      parent
    } = this;
    return {
      arName: controls ? [arName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('AR_NUM_ONE_AR')
      ]] : arName,
      enName: controls ? [enName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('ENG_NUM_ONE_ENG')
      ]] : enName,
      parent: controls ? [parent, [CustomValidators.required]] : parent,
    }
  }
}
