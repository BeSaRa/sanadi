import {IModelInterceptor} from "@contracts/i-model-interceptor";
import {DeductionRatioItem} from "@app/models/deduction-ratio-item";
import { AdminResult } from "@app/models/admin-result";

export class DeductionRatioItemInterceptor implements IModelInterceptor<DeductionRatioItem> {

  send(model: Partial<DeductionRatioItem>): Partial<DeductionRatioItem> {
    model.profile = JSON.stringify({'ids':[model.profile as string]})
    delete model.service;
    delete model.searchFields;
    delete model.statusInfo;
    delete model.langService;
    return model
  }
  
  receive(model: DeductionRatioItem): DeductionRatioItem {
    model.statusInfo = AdminResult.createInstance(model.statusInfo)
    model.profile = JSON.parse(model.profile as any)['ids'][0]
    return model
  }
}
