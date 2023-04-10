import { INames } from '@app/interfaces/i-names';
import { FactoryService } from '@app/services/factory.service';
import { ServiceDataFollowupConfigurationService } from '@services/service-data-followup-configuration.service';
import { LangService } from '@app/services/lang.service';
import { ISearchFieldsMap } from '@app/types/types';
import { BaseModel } from './base-model';
import { Lookup } from './lookup';
import { CustomValidators } from '@app/validators/custom-validators';
import { Team } from '@app/models/team';
import { FollowUpType } from '@app/enums/followUp-type.enum';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { normalSearchFields } from '@helpers/normal-search-fields';
import { infoSearchFields } from '@helpers/info-search-fields';
import { ServiceDataFollowupConfigurationInterceptor } from '@model-interceptors/service-data-followup-configuration-interceptor';
import { InterceptModel } from "@decorators/intercept-model";

const { send, receive } = new ServiceDataFollowupConfigurationInterceptor();

@InterceptModel({ send, receive })
export class ServiceDataFollowupConfiguration extends BaseModel<ServiceDataFollowupConfiguration, ServiceDataFollowupConfigurationService> {
  service: ServiceDataFollowupConfigurationService;
  langService: LangService;

  constructor() {
    super();
    this.service = FactoryService.getService('ServiceDataFollowupConfigurationService');
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

  searchFields: ISearchFieldsMap<ServiceDataFollowupConfiguration> = {
    ...normalSearchFields(['days']),
    ...infoSearchFields(['requestTypeInfo', 'followUpTypeInfo', 'responsibleTeamInfo', 'concernedTeamInfo']),
    name: text => this.getName().toLowerCase().indexOf(text) !== -1
  };

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  buildForm(controls: boolean = false): any {
    const {arName, enName, arDesc, enDesc, followUpType, requestType, responsibleTeamId, concernedTeamId, days} = this;
    return {
      arName: controls ? [arName, [CustomValidators.required, CustomValidators.pattern('AR_NUM')]] : arName,
      enName: controls ? [enName, [CustomValidators.required, CustomValidators.pattern('ENG_NUM')]] : enName,
      arDesc: controls ? [arDesc, [CustomValidators.required, CustomValidators.pattern('AR_NUM'), CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : arDesc,
      enDesc: controls ? [enDesc, [CustomValidators.required, CustomValidators.pattern('ENG_NUM'), CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : enDesc,
      followUpType: controls ? [followUpType, [CustomValidators.required]] : followUpType,
      requestType: controls ? [requestType, [CustomValidators.required]] : requestType,
      responsibleTeamId: controls ? [{value: responsibleTeamId, disabled: followUpType === FollowUpType.INTERNAL}] : responsibleTeamId,
      concernedTeamId: controls ? [{value: concernedTeamId, disabled: followUpType === FollowUpType.EXTERNAL}] : concernedTeamId,
      days: controls ? [days, [CustomValidators.required, CustomValidators.number]] : days
    };
  }

  updateStatus(newStatus: CommonStatusEnum): any {
    return this.service.updateStatus(this.id, newStatus);
  }


}
