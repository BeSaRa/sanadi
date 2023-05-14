import { INames } from '@app/interfaces/i-names';
import { LangService } from '@app/services/lang.service';
import { FactoryService } from '@app/services/factory.service';
import { BaseModel } from '@app/models/base-model';
import { BankService } from '@app/services/bank.service';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { Lookup } from '@app/models/lookup';
import { CustomValidators } from '@app/validators/custom-validators';
import {ISearchFieldsMap, searchFunctionType} from '@app/types/types';
import { BankInterceptor } from "@app/model-interceptors/bank-interceptor";
import { InterceptModel } from "@decorators/intercept-model";
import {normalSearchFields} from "@helpers/normal-search-fields";

const interceptor = new BankInterceptor();

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})
export class Bank extends BaseModel<Bank, BankService> {
  service!: BankService;
  status: number = CommonStatusEnum.ACTIVATED;
  statusInfo!: Lookup;
  langService: LangService;

  constructor() {
    super();
    this.service = FactoryService.getService('BankService');
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this[(this.langService?.map.lang + 'Name') as keyof INames] || '';
  }

  searchFields: ISearchFieldsMap<Bank> = {
    ...normalSearchFields(['arName', 'enName'])
  };

  buildForm(controls?: boolean): any {
    const {
      arName,
      enName,
      status
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
      status: controls ? [status, [CustomValidators.required]] : status
    }
  }

  toggleStatus(): Bank {
    if (this.status == CommonStatusEnum.ACTIVATED) {
      this.status = CommonStatusEnum.DEACTIVATED
    } else if (this.status == CommonStatusEnum.DEACTIVATED) {
      this.status = CommonStatusEnum.ACTIVATED
    }

    return this;
  }
}
