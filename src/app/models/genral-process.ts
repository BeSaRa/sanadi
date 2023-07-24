import { Lookup } from './lookup';
import { CommonStatusEnum } from './../enums/common-status.enum';
import { CustomValidators } from './../validators/custom-validators';
import { searchFunctionType } from './../types/types';
import { GeneralProcessService } from './../services/general-process.service';
import { BaseModel } from '@app/models/base-model';
import { INames } from '@contracts/i-names';
import { LangService } from '@app/services/lang.service';
import { FactoryService } from '@app/services/factory.service';

export class GeneralProcess extends BaseModel<GeneralProcess, GeneralProcessService> {
  arName!: string;
  enName!: string;

  mainClass!: number;
  subClass!: number;

  departmentId!: number;
  teamId!: number;
  subTeamId!: number;
  processType!: number;

  active!: true;

  template!: string;

  status: number = CommonStatusEnum.ACTIVATED;
  statusInfo!: Lookup;
  // extra properties
  langService: LangService;
  service!: GeneralProcessService;
  searchFields: { [key: string]: searchFunctionType | string } = {
    arName: 'arName',
    enName: 'enName',
  };

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
    this.service = FactoryService.getService('GeneralProcessService')
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
      mainClass,
      subClass,
      departmentId,
      teamId,
      processType,
      subTeamId
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
      processType: controls ? [processType, [CustomValidators.required]] : processType,
      mainClass: controls ? [mainClass, [CustomValidators.required]] : mainClass,
      subClass: controls ? [subClass, [CustomValidators.required]] : subClass,
      departmentId: controls ? [departmentId, [CustomValidators.required]] : departmentId,
      teamId: controls ? [teamId, [CustomValidators.required]] : teamId,
      subTeamId: controls ? [subTeamId, [CustomValidators.required]] : subTeamId,
    }
  }
}
