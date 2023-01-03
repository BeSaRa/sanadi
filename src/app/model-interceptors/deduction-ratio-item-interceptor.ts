import {IModelInterceptor} from "@contracts/i-model-interceptor";
import {DeductionRatioItem} from "@app/models/deduction-ratio-item";
import {AdminResult} from "@app/models/admin-result";

export class DeductionRatioItemInterceptor implements IModelInterceptor<DeductionRatioItem> {

  send(model: Partial<DeductionRatioItem>): Partial<DeductionRatioItem> {
    // DON't do something like this again in the interceptor
    // you have to handle this inside the component
    // also if you have to do it at least find the enum related to this two number [ 3 , 4] you will find it -> ProjectPermitTypes
    // delete work area when permitType is charity or unconditional receive
    if (model.permitType == 3 || model.permitType == 4) {
      model.workArea = null
    }

    model.minLimit = Number(model.minLimit)
    model.maxLimit = Number(model.maxLimit)

    delete model.service;
    delete model.searchFields;
    delete model.statusInfo;
    delete model.langService;
    delete model.permitTypeInfo;
    delete model.workAreaInfo;

    return model
  }

  receive(model: DeductionRatioItem): DeductionRatioItem {
    model.profileTypesList = JSON.parse(model.profileTypes).ids
    model.statusInfo = AdminResult.createInstance(model.statusInfo)
    model.workAreaInfo = AdminResult.createInstance(model.workAreaInfo)
    model.permitTypeInfo = AdminResult.createInstance(model.permitTypeInfo)
    return model
  }
}
