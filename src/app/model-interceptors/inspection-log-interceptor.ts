import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { AdminResult } from "@app/models/admin-result";
import { InspectionLog } from "@app/models/inspection-log";

export class InspectionLogInterceptor implements IModelInterceptor<InspectionLog>
{
  send(model: Partial<InspectionLog>): Partial<InspectionLog> {
   
    InspectionLogInterceptor._deleteBeforeSend(model);
    return model;
  }
  receive(model: InspectionLog): InspectionLog {

    model.inspectionStatusInfo = AdminResult.createInstance(model.inspectionStatusInfo);
    model.inspectorInfo = AdminResult.createInstance(model.inspectorInfo);
    return model
  }
  private static _deleteBeforeSend(model: Partial<InspectionLog>): void {
  
    delete model.inspectorInfo
    delete model.inspectionStatusInfo

  }
}
