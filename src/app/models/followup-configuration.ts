import {INames} from '@app/interfaces/i-names';
import {FactoryService} from '@app/services/factory.service';
import {FollowupConfigurationService} from '@app/services/followup-configuration.service';
import {LangService} from '@app/services/lang.service';
import {searchFunctionType} from '@app/types/types';
import {BaseModel} from './base-model';
import {Lookup} from './lookup';
import {CustomValidators} from '@app/validators/custom-validators';
import {Team} from '@app/models/team';
import {FollowUpType} from '@app/enums/followUp-type.enum';

export class FollowupConfiguration extends BaseModel<FollowupConfiguration, FollowupConfigurationService> {
  service: FollowupConfigurationService;
  langService: LangService;

  constructor() {
    super();
    this.service = FactoryService.getService('FollowupConfigurationService');
    this.langService = FactoryService.getService('LangService');

  }

  serviceId!: number;
  caseType!: number;
  arDesc!: string;
  enDesc!: string;
  requestType!: number;
  followUpType!: number;
  responsibleTeamId!: number;
  concernedTeamId!: number;
  status!: number;
  statusDateModified!: string;
  days!: number;
  requestTypeInfo!: Lookup;
  followUpTypeInfo!: Lookup;
  responsibleTeamInfo!: Team;
  concernedTeamInfo!: Team;

  searchFields: { [key: string]: searchFunctionType | string } = {
    arName: 'arName',
    enName: 'enName',
    requestType: text => !this.requestTypeInfo ? false : this.requestTypeInfo.getName().toLowerCase().indexOf(text) !== -1,
    followUpType: text => !this.followUpTypeInfo ? false : this.followUpTypeInfo.getName().toLowerCase().indexOf(text) !== -1,
  };

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  buildForm(controls: boolean = false): any {
    const {arName, enName, arDesc, enDesc, followUpType, requestType, responsibleTeamId, concernedTeamId, days} = this;
    return {
      arName: controls? [arName, [CustomValidators.required] ] : arName ,
      enName: controls? [enName, [CustomValidators.required] ] : enName ,
      arDesc: controls? [arDesc, [CustomValidators.required] ] : arDesc ,
      enDesc: controls? [enDesc, [CustomValidators.required] ] : enDesc ,
      followUpType: controls? [followUpType, [CustomValidators.required] ] : followUpType ,
      requestType: controls? [requestType, [CustomValidators.required] ] : requestType ,
      responsibleTeamId: controls? [{value: responsibleTeamId, disabled: followUpType === FollowUpType.INTERNAL}] : responsibleTeamId ,
      concernedTeamId: controls? [{value: concernedTeamId, disabled: followUpType === FollowUpType.EXTERNAL}] : concernedTeamId ,
      days: controls? [days, [CustomValidators.required, CustomValidators.number] ] : days
    }
  }


}
