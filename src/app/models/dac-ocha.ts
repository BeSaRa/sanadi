import {BaseModel} from '@app/models/base-model';
import {DacOchaService} from '@app/services/dac-ocha.service';
import {FactoryService} from '@app/services/factory.service';
import {LangService} from '@app/services/lang.service';
import {searchFunctionType} from '@app/types/types';
import {INames} from '@app/interfaces/i-names';
import {CustomValidators} from '@app/validators/custom-validators';
import {Lookup} from '@app/models/lookup';
import {Observable} from 'rxjs';

export class DacOcha extends BaseModel<DacOcha, DacOchaService> {
  status!: number;
  type!: number;
  service: DacOchaService;
  langService: LangService;
  statusInfo!: Lookup;
  parentId?: number;
  searchFields: { [key: string]: searchFunctionType | string } = {
    arName: 'arName',
    enName: 'enName',
    statusInfo: text => !this.statusInfo ? false : this.statusInfo.getName().toLowerCase().indexOf(text) !== -1
  };

  constructor() {
    super();
    this.service = FactoryService.getService('DacOchaService');
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
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
      type: controls ? [type] : type
    }
  }

  loadSubDacOchas(): Observable<DacOcha[]> {
    return this.service.loadSubDacOchas(this.id);
  }
}
