import {IModelInterceptor} from "@contracts/i-model-interceptor";
import {DeductionRatioItem} from "@app/models/deduction-ratio-item";

export class DeductionRatioItemInterceptor implements IModelInterceptor<DeductionRatioItem> {

  send(model: Partial<DeductionRatioItem>): Partial<DeductionRatioItem> {
    return model
  }

  receive(model: DeductionRatioItem): DeductionRatioItem {
    return model
  }
}
