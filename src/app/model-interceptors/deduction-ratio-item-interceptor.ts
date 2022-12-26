import {IModelInterceptor} from "@contracts/i-model-interceptor";
import {DeductionRatioItem} from "@app/models/deduction-ratio-item";
import {AdminResult} from "@app/models/admin-result";

export class DeductionRatioItemInterceptor implements IModelInterceptor<DeductionRatioItem> {

  send(model: Partial<DeductionRatioItem>): Partial<DeductionRatioItem> {
    model.profile = JSON.stringify({'profileIds': model.profile})
    delete model.service;
    delete model.searchFields;
    delete model.statusInfo;
    delete model.langService;
    return model
  }

  receive(model: DeductionRatioItem): DeductionRatioItem {
    const profile = (JSON.parse(model.profile))
    model.statusInfo = AdminResult.createInstance(model.statusInfo)
    model.profile = profile.hasOwnProperty('profileIds') ? profile.profileIds : profile
    return model
  }
}
