import { INames } from "@app/interfaces/i-names";
import { FactoryService } from "@app/services/factory.service";
import { FollowupConfigurationService } from "@app/services/followup-configuration.service";
import { LangService } from "@app/services/lang.service";
import { searchFunctionType } from "@app/types/types";
import { BaseModel } from "./base-model";
import { Lookup } from "./lookup";

export class FollowupConfiguration extends BaseModel<FollowupConfiguration, FollowupConfigurationService>{
  service: FollowupConfigurationService;
  langService: LangService;
  constructor(){
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

  searchFields: { [key: string]: searchFunctionType | string } = {
    arName: 'arName',
    enName: 'enName',
    requestType: text => !this.requestTypeInfo ? false : this.requestTypeInfo.getName().toLowerCase().indexOf(text) !== -1,
    followUpType: text => !this.followUpTypeInfo ? false : this.followUpTypeInfo.getName().toLowerCase().indexOf(text) !== -1,
  };

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }
}
