import {BaseModel} from '@app/models/base-model';
import {FollowupService} from '@app/services/followup.service';
import {LangService} from '@app/services/lang.service';
import {FactoryService} from '@app/services/factory.service';
import {searchFunctionType} from '@app/types/types';
import {INames} from '@app/interfaces/i-names';
import {FollowupConfiguration} from '@app/models/followup-configuration';
import {Lookup} from '@app/models/lookup';

export class Followup extends BaseModel<Followup, FollowupService> {
  service: FollowupService;
  langService: LangService;

  constructor() {
    super();
    this.service = FactoryService.getService('FollowupService');
    this.langService = FactoryService.getService('LangService');
  }

  orgId!: number;
  followUpConfigrationId!: number;
  serviceId!: number;
  caseId!: string;
  arDesc!: string;
  enDesc!: string;
  followUpType!: number;
  responsibleTeamId!: number;
  concernedTeamId!: number;
  status!: number;
  statusDateModified!: string;
  dueDate!: string;
  custom!: boolean;

  followUpConfigrationInfo!: Lookup;
  followUpTypeInfo!:Lookup;
  serviceInfo!:Lookup;
  statusInfo!:Lookup;
  orgInfo!:Lookup;

  searchFields: { [key: string]: searchFunctionType | string } = {
    arName: 'arName',
    enName: 'enName',
    status: text => !this.statusInfo ? false : this.statusInfo.getName().toLowerCase().indexOf(text) !== -1,
    serviceType: text => !this.serviceInfo ? false : this.serviceInfo.getName().toLowerCase().indexOf(text) !== -1,
  };

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }
}
