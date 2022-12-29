import {IModelInterceptor} from "@contracts/i-model-interceptor";
import {DeductionRatioItem} from "@app/models/deduction-ratio-item";
import {AdminResult} from "@app/models/admin-result";

export class DeductionRatioItemInterceptor implements IModelInterceptor<DeductionRatioItem> {

  send(model: Partial<DeductionRatioItem>): Partial<DeductionRatioItem> {
    // delete work area when permitType is charity or unconditional receive
    if(model.permitType == 3 || model.permitType == 4 ){
        model.workArea = null
    }
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
