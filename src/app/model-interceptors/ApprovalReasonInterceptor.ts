import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {ApprovalReason} from "@app/models/approval-reason";

export class ApprovalReasonInterceptor implements IModelInterceptor<ApprovalReason> {
  send(model: Partial<ApprovalReason>): Partial<ApprovalReason> {
    delete model.searchFields;
    delete model.auditOperation;
    return model;
  }

  receive(model: ApprovalReason): ApprovalReason {
    return model;
  }
}
