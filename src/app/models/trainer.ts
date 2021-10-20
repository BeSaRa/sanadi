import {BaseModel} from '@app/models/base-model';
import {TrainerService} from '@app/services/trainer.service';
import {FactoryService} from '@app/services/factory.service';
import {INames} from '@app/interfaces/i-names';
import {LangService} from '@app/services/lang.service';
import {searchFunctionType} from '@app/types/types';
import {CustomValidators} from '@app/validators/custom-validators';

export class Trainer extends BaseModel<Trainer, TrainerService> {
  specialization!: string;
  jobTitle!: string;
  langList!: string;
  nationality!: number;
  email!: string;
  phoneNumber!: string;
  address!: string;
  organizationUnit!: string;

  service: TrainerService;
  langService: LangService;
  searchFields: { [key: string]: searchFunctionType | string } = {
    arName: 'arName',
    enName: 'enName',
    specialization: 'specialization'
  };

  constructor() {
    super();
    this.service = FactoryService.getService('TrainerService');
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  buildForm(controls?: boolean): any {
    const {
      arName,
      enName
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
      ]] : enName
    }
  }
}
