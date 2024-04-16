import { CaseTypes } from "@app/enums/case-types.enum";
import { AdminResult } from "@app/models/admin-result";
import { TaskDetails } from "@app/models/task-details";

export class GeneralInterceptor {
  static receive(model: any): any {
    model.setItemRoute && model.setItemRoute();
    model.taskDetails && (model.taskDetails = new TaskDetails().clone(model.taskDetails));
    model.taskDetails && (model.taskDetails.fromUserInfo = AdminResult.createInstance(model.taskDetails.fromUserInfo ?? {}));
    model.creatorInfo && (model.creatorInfo = AdminResult.createInstance(model.creatorInfo))
    model.ouInfo && (model.ouInfo = AdminResult.createInstance(model.ouInfo))
    model.caseStatusInfo && (model.caseStatusInfo = AdminResult.createInstance(model.caseStatusInfo));
    model.inspectionStatusInfo && (model.inspectionStatusInfo = AdminResult.createInstance(model.inspectionStatusInfo));
    model.inspectorInfo && (model.inspectorInfo = AdminResult.createInstance(model.inspectorInfo));
    return model;
  }

  static send(model: any): any {
    delete model.searchFields;
    delete model.service;
    delete model.employeeService;
    delete model.langService;
    delete model.dialog;
    delete model.encrypt;
    delete model.itemRoute;
    delete model.itemDetails;
    delete model.inboxService;
    delete model.caseStatusInfo;
    delete model.creatorInfo;
    delete model.ouInfo;
    delete model.auditOperation;

    if (model.caseType === CaseTypes.COORDINATION_WITH_ORGANIZATION_REQUEST) {
      if (!!model.taskDetails?.piid && !model.taskDetails.isMain) {
        model.taskDetails = { piid: model.taskDetails.piid };
        return model;
      }
    }
    delete model.inspectionStatusInfo;
    delete model.inspectorInfo;
    delete model.taskDetails;
    return model;
  }
}
