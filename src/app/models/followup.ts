import {BaseModel} from '@app/models/base-model';
import {FollowupService} from '@app/services/followup.service';
import {LangService} from '@app/services/lang.service';
import {FactoryService} from '@app/services/factory.service';
import {searchFunctionType} from '@app/types/types';
import {INames} from '@app/interfaces/i-names';
import {Lookup} from '@app/models/lookup';
import {IDescriptions} from '@app/interfaces/I-descriptions';
import {CustomValidators} from '@app/validators/custom-validators';
import {FollowUpType} from '@app/enums/followUp-type.enum';

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
    caseId: 'caseId',
    status: text => !this.statusInfo ? false : this.statusInfo.getName().toLowerCase().indexOf(text) !== -1,
    serviceType: text => !this.serviceInfo ? false : this.serviceInfo.getName().toLowerCase().indexOf(text) !== -1,
    org: text => !this.orgInfo ? false : this.orgInfo.getName().toLowerCase().indexOf(text) !== -1,
  };

  public getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }
  getDesc(): string {
    return this[(this.langService.map.lang + 'Desc') as keyof  IDescriptions];
  }

  buildForm(controls: boolean = false): any {
    const {arName, enName, arDesc, enDesc, followUpType, responsibleTeamId, concernedTeamId, dueDate} = this;
    return {
      arName: controls? [arName, [CustomValidators.required] ] : arName ,
      enName: controls? [enName, [CustomValidators.required] ] : enName ,
      arDesc: controls? [arDesc, [CustomValidators.required] ] : arDesc ,
      enDesc: controls? [enDesc, [CustomValidators.required] ] : enDesc ,
      followUpType: controls? [followUpType, [CustomValidators.required] ] : followUpType ,
      responsibleTeamId: controls? [{value: responsibleTeamId, disabled: followUpType === FollowUpType.INTERNAL}] : responsibleTeamId ,
      concernedTeamId: controls? [{value: concernedTeamId, disabled: followUpType === FollowUpType.EXTERNAL}] : concernedTeamId ,
      dueDate: controls? [dueDate, [CustomValidators.required] ] : dueDate
    }
  }
}
