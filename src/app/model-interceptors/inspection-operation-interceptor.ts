import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { AdminResult } from "@app/models/admin-result";
import { InspectionOperation } from "@app/models/inspection-operation";

export class InspectionOperationInterceptor implements IModelInterceptor<InspectionOperation> {
  receive(model: InspectionOperation): InspectionOperation {
    model.actualTaskInfo && (model.actualTaskInfo = AdminResult.createInstance(model.actualTaskInfo??{}));
    model.parentInfo && (model.parentInfo = AdminResult.createInstance(model.parentInfo??{}));
    return model;
  }

  send(model: Partial<InspectionOperation>): Partial<InspectionOperation> {
    InspectionOperationInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<InspectionOperation> | any): void {
    delete model.service;
    delete model.langService;
    delete model.searchFields;
    delete model.actualTaskInfo;
    delete model.parentInfo;
  }

}
