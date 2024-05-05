import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { AdminResult } from "@app/models/admin-result";
import { InspectionActionLog } from "@app/models/inspection-action-log";

export class InspectionActionLogInterceptor implements IModelInterceptor<InspectionActionLog>
{
  send(model: Partial<InspectionActionLog>): Partial<InspectionActionLog> {
   
    InspectionActionLogInterceptor._deleteBeforeSend(model);
    return model;
  }
  receive(model: InspectionActionLog): InspectionActionLog {

    model.actionInfo = AdminResult.createInstance(model.actionInfo);
    model.userInfo = AdminResult.createInstance(model.userInfo);
    return model
  }
  private static _deleteBeforeSend(model: Partial<InspectionActionLog>): void {
  
    delete model.actionInfo
    delete model.userInfo

  }
}
