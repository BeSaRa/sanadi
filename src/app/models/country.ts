import { BaseModel } from './base-model';
import { CountryService } from '@services/country.service';
import { FactoryService } from '@services/factory.service';
import { INames } from '@contracts/i-names';
import { LangService } from '@services/lang.service';
import { AdminResult } from './admin-result';
import { ISearchFieldsMap } from '../types/types';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { CountryInterceptor } from "@app/model-interceptors/country-interceptor";
import { InterceptModel } from "@decorators/intercept-model";
import { normalSearchFields } from "@helpers/normal-search-fields";
import { infoSearchFields } from "@helpers/info-search-fields";
import { CustomValidators } from "@app/validators/custom-validators";

const interceptor = new CountryInterceptor()

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive
})
export class Country extends BaseModel<Country, CountryService> {
  parentId?: number;
  riskLevel!: number;
  statusDateModified!: string;
  status: number = CommonStatusEnum.ACTIVATED;
  requiredAttentionLevel!: number;
  privateConditionAr!: string;
  privateConditionEn!: string;

  parentInfo!: AdminResult;
  statusInfo!: AdminResult;
  riskLevelInfo!: AdminResult;
  requiredAttentionLevelInfo!: AdminResult;
  service: CountryService;
  langService: LangService;
  statusDateModifiedString: string = '';

  searchFields: ISearchFieldsMap<Country> = {
    ...normalSearchFields(['arName', 'enName', 'statusDateModifiedString']),
    ...infoSearchFields(['riskLevelInfo', 'requiredAttentionLevelInfo', 'statusInfo'])
  };

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
    this.service = FactoryService.getService('CountryService');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  updateStatus(newStatus: CommonStatusEnum): any {
    return this.service.updateStatus(this.id, newStatus);
  }

  isRetiredCountry(): boolean {
    return Number(this.status) === 2;
  }

  isInactiveCountry(): boolean {
    return Number(this.status) === 0;
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

  buildForm(controls?: boolean): any {
    const { arName, enName, status, riskLevel, requiredAttentionLevel } = this;
    return {
      arName: controls ? [arName, [CustomValidators.required,
      CustomValidators.maxLength(100),
      CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
      CustomValidators.pattern('AR_NUM_ONE_AR')
      ]] : arName,
      enName: controls ? [enName, [CustomValidators.required,
      CustomValidators.maxLength(100),
      CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
      CustomValidators.pattern('ENG_NUM_ONE_ENG')
      ]] : enName,
      riskLevel: controls ? [riskLevel] : riskLevel,
      requiredAttentionLevel: controls ? [requiredAttentionLevel] : requiredAttentionLevel
    }
  }

  buildCountryConditionsForm(controls?: boolean) {
    const { riskLevel, privateConditionAr, privateConditionEn } = this;
    return {

      riskLevel: controls ? [riskLevel, CustomValidators.required] : riskLevel,
      privateConditionEn: controls ?
        [privateConditionEn,
          [
            CustomValidators.required,
             CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS),
             CustomValidators.pattern('ENG_NUM_ONE_ENG')
            ]
        ] : privateConditionEn,
      privateConditionAr: controls ?
        [privateConditionAr,
          [
            CustomValidators.required,
             CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS),
             CustomValidators.pattern('AR_NUM_ONE_AR')
            ]
        ] : privateConditionAr,
    }
  }

}
