import {BaseModel} from "@app/models/base-model";
import {DeductionRatioItemService} from "@services/deduction-ratio-item.service";
import {FactoryService} from "@services/factory.service";
import {LangService} from "@services/lang.service";
import {InterceptModel} from "@decorators/intercept-model";
import {DeductionRatioItemInterceptor} from "@app/model-interceptors/deduction-ratio-item-interceptor";
import {INames} from "@contracts/i-names";
import {DeductedPercentage} from "@app/models/deducted-percentage";
import {AdminResult} from "@app/models/admin-result";
import { searchFunctionType } from "@app/types/types";
import { CommonStatusEnum } from "@app/enums/common-status.enum";
import { CustomValidators } from "@app/validators/custom-validators";

const {receive, send} = new DeductionRatioItemInterceptor()

@InterceptModel({receive, send})
export class DeductionRatioItem extends BaseModel<DeductionRatioItem, DeductionRatioItemService> {
  maxLimit!: number;
  minLimit!: number;
  permitType!: 1;
  profile!: string;
  status!: number;
  workArea!: number;
  service: DeductionRatioItemService;
  langService!: LangService
  statusInfo!:AdminResult;
  
  constructor() {
    super();
    this.service = FactoryService.getService('DeductionRatioItemService')
    this.langService = FactoryService.getService('LangService');
  }

  getName(currentLang: string): string {
    return this[currentLang + 'Name' as keyof INames]
  }

  convertToDeductionPercent(): DeductedPercentage {
    return new DeductedPercentage().clone({
      deductionPercent: this.minLimit,
      deductionType: this.id,
      deductionTypeInfo: AdminResult.createInstance({
        arName: this.arName,
        enName: this.enName
      })
    })
  }

  searchFields: { [key: string]: searchFunctionType | string } = {
    arName: 'arName',
    enName: 'enName',
    status: text => !this.statusInfo ? false : this.statusInfo.getName().toLowerCase().indexOf(text) !== -1,
  };

  updateStatus(newStatus: CommonStatusEnum): any {
    return this.service.updateStatus(this.id, newStatus);
  }

  buildForm(controls?: boolean): any {
    const {
      arName,
      enName,
      status,
      profile,
      workArea,
      permitType,
      maxLimit,
      minLimit
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
      status: controls ? [status, [CustomValidators.required]] : status,
      profile: controls ? [profile, [CustomValidators.required]] : profile,
      workArea: controls ? [workArea, [CustomValidators.required]] : workArea,
      permitType: controls ? [permitType, [CustomValidators.required]] : permitType,
      maxLimit: controls ? [maxLimit, [CustomValidators.required]] : maxLimit,
      minLimit: controls ? [minLimit, [CustomValidators.required].concat(CustomValidators.commonValidations.decimalWithMinValue(2,0.1))] : minLimit,
    }
  }
}
