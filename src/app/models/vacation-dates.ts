import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { INames } from '@app/interfaces/i-names';
import { VacationDatesInerceptor } from '@app/model-interceptors/vacation-date-interceptor';
import { FactoryService } from '@app/services/factory.service';
import { LangService } from '@app/services/lang.service';
import { VacationDatesService } from '@app/services/vacation-dates.service';
import { searchFunctionType } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { IMyDateModel } from '@nodro7/angular-mydatepicker';
import { BaseModel } from './base-model';


const interceptor = new VacationDatesInerceptor()

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})
export class VacationDates extends BaseModel<VacationDates, VacationDatesService> {
  service!: VacationDatesService;
  langService: LangService = FactoryService.getService('LangService');
  vacationDateFrom!: string | IMyDateModel;
  vacationDateTo!: string | IMyDateModel;
  periodId!: number;
  searchFields: { [key: string]: searchFunctionType | string } = {
    arName: 'arName',
    enName: 'enName',
    vacationDateFrom: 'vacationDateFrom',
    vacationDateTo: 'vacationDateTo'
  };

  constructor() {
    super();
    this.service = FactoryService.getService('VacationDatesService');
  }
  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  buildForm(withControls = true): IKeyValue {
    const { arName, enName, vacationDateFrom, vacationDateTo } = this;
    return {
      arName: withControls ? [arName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('AR_NUM_ONE_AR')
      ]] : arName,
      enName: withControls ? [enName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('ENG_NUM_ONE_ENG')
      ]] : enName,
      vacationDateFrom: withControls ? [vacationDateFrom, [
        CustomValidators.required
      ]] : vacationDateFrom,

      vacationDateTo: withControls ? [vacationDateTo, [
        CustomValidators.required
      ]] : vacationDateTo,
    };
  }

}
