import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {Goal} from "@app/models/goal";
import {AdminResult} from "@app/models/admin-result";

export class GoalInterceptor implements IModelInterceptor<Goal> {
  send(model: Partial<Goal>): Partial<Goal> {
    model.mainUNOCHACategory = model.mainUNOCHACategoryInfo ? model.mainUNOCHACategoryInfo?.id : null;
    model.mainDACCategory = model.mainDACCategoryInfo ? model.mainDACCategoryInfo?.id : null;
    model.domain =  model.domainInfo?.id ;

    delete model.mainUNOCHACategoryInfo;
    delete model.mainDACCategoryInfo;
    delete model.domainInfo;
    delete model.searchFields;
    return model;
  }

  receive(model: Goal): Goal {
    model.mainUNOCHACategoryInfo = AdminResult.createInstance(model.mainUNOCHACategoryInfo);
    model.mainDACCategoryInfo = AdminResult.createInstance(model.mainDACCategoryInfo);
    model.domainInfo = AdminResult.createInstance(model.domainInfo);

    return model;
  }
}
