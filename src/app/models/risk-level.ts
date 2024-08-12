import { InterceptModel } from "@app/decorators/decorators/intercept-model";
import { normalSearchFields } from "@app/helpers/normal-search-fields";
import { INames } from "@app/interfaces/i-names";
import { RiskLevelInterceptor } from "@app/model-interceptors/risk-level-interceptor";
import { FactoryService } from "@app/services/factory.service";
import { LangService } from "@app/services/lang.service";
import { RiskLevelService } from "@app/services/risk-level.service";
import { ISearchFieldsMap } from "@app/types/types";
import { CustomValidators } from "@app/validators/custom-validators";
import { AdminResult } from "./admin-result";
import { BaseModel } from "./base-model";

const {send,receive} = new RiskLevelInterceptor();

@InterceptModel({send,receive})

export class RiskLevel extends BaseModel<RiskLevel, RiskLevelService> {

    publicConditionAr!: string;
    publicConditionEn!: string;
    requiredAttentionLevel!: number;
   
    requiredAttentionLevelInfo!: AdminResult;

    service: RiskLevelService;

    langService!: LangService;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
    this.service = FactoryService.getService('RiskLevelService')
  }

  searchFields: ISearchFieldsMap<RiskLevel> = {
    ...normalSearchFields(['arName', 'enName']),
  };

  buildForm(controls?: boolean): any {
    const {
      arName,
      enName,
      publicConditionAr,
      publicConditionEn,
      requiredAttentionLevel
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
      publicConditionEn: controls ? [publicConditionEn, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
      ]] : publicConditionEn,
      publicConditionAr: controls ? [publicConditionAr, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
      ]] : publicConditionAr,
      requiredAttentionLevel: controls ? [requiredAttentionLevel, [CustomValidators.required]] : requiredAttentionLevel
    }
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }
}
