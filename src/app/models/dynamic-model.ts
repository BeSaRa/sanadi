import { Lookup } from './lookup';
import { CommonStatusEnum } from './../enums/common-status.enum';
import { normalSearchFields } from "@app/helpers/normal-search-fields";
import { INames } from "@app/interfaces/i-names";
import { DynamicModelService } from "@app/services/dynamic-models.service";
import { FactoryService } from "@app/services/factory.service";
import { LangService } from "@app/services/lang.service";
import { ISearchFieldsMap } from "@app/types/types";
import { CustomValidators } from "@app/validators/custom-validators";
import { BaseModel } from "./base-model";

export class DynamicModel extends BaseModel<DynamicModel, DynamicModelService>{
  arName!: string;
  enName!: string;
  status: number = CommonStatusEnum.ACTIVATED;
  statusInfo!: Lookup;

  template!: string;

  // extra properties
  langService: LangService;
  service!: DynamicModelService;
  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
    this.service = FactoryService.getService('DynamicModelService')
  }

  searchFields: ISearchFieldsMap<DynamicModel> = {
    ...normalSearchFields(['arName', 'enName']),
  };
  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  updateStatus(newStatus: CommonStatusEnum): any {
    return this.service.updateStatus(this.id, newStatus);
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
        CustomValidators.pattern('AR_NUM_ONE_AR')
      ]] : arName,
      enName: controls ? [enName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('ENG_NUM_ONE_ENG')
      ]] : enName,
    }
  }
}
