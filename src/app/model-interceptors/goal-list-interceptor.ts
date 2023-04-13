import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { AdminResult } from "@app/models/admin-result";
import { GoalList } from "@app/models/goal-list";

export class GoalListInterceptor implements IModelInterceptor<GoalList> {
  send(model: Partial<GoalList>): Partial<GoalList> {
    model.mainUNOCHACategory = model.mainUNOCHACategoryInfo ? model.mainUNOCHACategoryInfo?.id : null;
    model.mainDACCategory = model.mainDACCategoryInfo ? model.mainDACCategoryInfo?.id : null;
    model.domain =  model.domainInfo?.id ;

    delete model.mainUNOCHACategoryInfo;
    delete model.mainDACCategoryInfo;
    delete model.domainInfo;
    delete model.searchFields;
    delete model.auditOperation;
    return model;
  }

  receive(model: GoalList): GoalList {
    model.mainUNOCHACategoryInfo = AdminResult.createInstance(model.mainUNOCHACategoryInfo);
    model.mainDACCategoryInfo = AdminResult.createInstance(model.mainDACCategoryInfo);
    model.domainInfo = AdminResult.createInstance(model.domainInfo);

    return model;
  }
}
