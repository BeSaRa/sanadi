import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {Goal} from "@app/models/goal";
import {AdminResult} from "@app/models/admin-result";

export class GoalInterceptor implements IModelInterceptor<Goal> {
  send(model: Partial<Goal>): Partial<Goal> {

    delete model.searchFields;
    return model;
  }

  receive(model: Goal): Goal {


    return model;
  }
}
