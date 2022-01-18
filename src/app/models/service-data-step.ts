import {BaseModel} from '@app/models/base-model';
import {ServiceDataStepService} from '@app/services/service-data-step.service';
import {INames} from '@app/interfaces/i-names';
import {CustomValidators} from '@app/validators/custom-validators';
import {FactoryService} from '@app/services/factory.service';
import {LangService} from '@app/services/lang.service';

export class ServiceDataStep extends BaseModel<ServiceDataStep, ServiceDataStepService>{
  service!: ServiceDataStepService;
  langService: LangService;
  serviceId!: number;
  caseType!: number;
  activityName!: string;
  stepName!: string;
  arDesc!: string;
  enDesc!: string;
  stepSLA!: number;

  constructor() {
    super();
    this.service = FactoryService.getService('ServiceDataStepService');
    this.langService = FactoryService.getService('LangService');
  }

  loadSteps() {
    return this.service.stepsByServiceId(this.id);
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  buildForm(controls?: boolean): any {
    const {
      arName,
      enName,
      arDesc,
      enDesc,
      stepName,
      activityName,
      stepSLA

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
      arDesc: controls ? [{value: arDesc, disabled: true}, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('AR_NUM')
      ]] : arDesc,
      enDesc: controls ? [{value: enDesc, disabled: true}, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('ENG_NUM')
      ]] : enDesc,
      stepName: controls ? [{value: stepName, disabled: true}] : stepName,
      activityName: controls ? [{value: activityName, disabled: true}] : activityName,
      stepSLA: controls ? [stepSLA] : stepSLA,
    }
  }
}
