import {BaseModel} from "@app/models/base-model";
import {DeductionRatioItemService} from "@services/deduction-ratio-item.service";
import {FactoryService} from "@services/factory.service";
import {LangService} from "@services/lang.service";
import {InterceptModel} from "@decorators/intercept-model";
import {DeductionRatioItemInterceptor} from "@app/model-interceptors/deduction-ratio-item-interceptor";
import {INames} from "@contracts/i-names";
import {DeductedPercentage} from "@app/models/deducted-percentage";
import {AdminResult} from "@app/models/admin-result";

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

  constructor() {
    super();
    this.service = FactoryService.getService('DeductionRatioItemService')
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
}
