import { Cloneable } from '@app/models/cloneable';
import { CustomValidators } from './../validators/custom-validators';
import { INames } from '@contracts/i-names';
import { LangService } from '@app/services/lang.service';
import { FactoryService } from '@app/services/factory.service';

export class GenerealProcessTemplate extends Cloneable<GenerealProcessTemplate>{
  identifyingName!: string;
  arName!: string;
  enName!: string;

  fieldType!: number;
  order!: number;
  regex!: string;
  note!: string;
  isRquired: boolean = false;

  langService: LangService;
  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  buildForm(controls?: boolean): any {
    const {
      identifyingName,
      arName,
      enName,
      fieldType,
      order,
      regex,
      note,
      isRquired
    } = this;
    return {
      identifyingName: controls ? [identifyingName, [
        CustomValidators.required,
        CustomValidators.maxLength(300),
        CustomValidators.minLength(3),
      ]] : identifyingName,
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
      isRquired: controls ? [isRquired] : isRquired,
      fieldType: controls ? [fieldType, [CustomValidators.required]] : fieldType,
      order: controls ? [order, [CustomValidators.required]] : order,
      regex: controls ? [regex, [CustomValidators.required]] : regex,
      note: controls ? [note, [CustomValidators.required]] : note,
    }
  }

}
