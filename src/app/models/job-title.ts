import {BaseModel} from '@app/models/base-model';
import {JobTitleService} from '@app/services/job-title.service';
import {FactoryService} from '@app/services/factory.service';
import {LangService} from '@app/services/lang.service';
import {INames} from '@app/interfaces/i-names';
import {Lookup} from '@app/models/lookup';
import {searchFunctionType} from '@app/types/types';
import {CustomValidators} from '@app/validators/custom-validators';
import {CommonStatusEnum} from '@app/enums/common-status.enum';

export class JobTitle extends BaseModel<JobTitle, JobTitleService> {
  type!: number;
  status!: number;
  statusInfo!: Lookup;
  service!: JobTitleService;
  langService: LangService;
  searchFields: { [key: string]: searchFunctionType | string } = {
    arName: 'arName',
    enName: 'enName',
    status: text => !this.statusInfo ? false : this.statusInfo.getName().toLowerCase().indexOf(text) !== -1,
  };

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
    this.service = FactoryService.getService('JobTitleService')
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  isRetired(): boolean {
    return Number(this.status) === CommonStatusEnum.RETIRED;
  }

  isInactive(): boolean {
    return Number(this.status) === CommonStatusEnum.DEACTIVATED;
  }

  isActive(): boolean {
    return Number(this.status) === CommonStatusEnum.ACTIVATED;
  }

  updateStatus(newStatus: CommonStatusEnum): any {
    return this.service.updateStatus(this.id, newStatus);
  }

  buildForm(controls?: boolean): any {
    const {
      arName,
      enName,
      status,
      type
    } = this;
    return {
      arName: controls ? [arName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('AR_NUM')
      ]] : arName,
      enName: controls ? [enName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('ENG_NUM')
      ]] : enName,
      status: controls ? [status, [CustomValidators.required]] : status,
      type: controls ? [type, [CustomValidators.required]] : type
    }
  }
}
