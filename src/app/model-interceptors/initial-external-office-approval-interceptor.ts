import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {InitialExternalOfficeApproval} from "@app/models/initial-external-office-approval";
import {AdminResult} from "@app/models/admin-result";
import {TaskDetails} from "@app/models/task-details";

export class InitialExternalOfficeApprovalInterceptor implements IModelInterceptor<InitialExternalOfficeApproval> {
  send(model: Partial<InitialExternalOfficeApproval>): Partial<InitialExternalOfficeApproval> {
    delete model.service;
    delete model.employeeService;
    delete model.taskDetails;
    delete model.caseStatusInfo;
    delete model.creatorInfo;
    delete model.ouInfo;
    delete model.specialistDecisionInfo;
    delete model.chiefDecisionInfo;
    delete model.managerDecisionInfo;
    delete model.generalManagerDecisionInfo;
    delete model.reviewerDepartmentDecisionInfo;
    delete model.deductionPercent;

    return model;
  }

  receive(model: InitialExternalOfficeApproval): InitialExternalOfficeApproval {
    model.taskDetails = (new TaskDetails()).clone(model.taskDetails);
    model.caseStatusInfo = AdminResult.createInstance(model.caseStatusInfo);
    model.creatorInfo = AdminResult.createInstance(model.creatorInfo);
    model.ouInfo = AdminResult.createInstance(model.ouInfo);
    model.specialistDecisionInfo = AdminResult.createInstance(model.specialistDecisionInfo);
    model.chiefDecisionInfo = AdminResult.createInstance(model.chiefDecisionInfo);
    model.managerDecisionInfo = AdminResult.createInstance(model.managerDecisionInfo);
    model.generalManagerDecisionInfo = AdminResult.createInstance(model.generalManagerDecisionInfo);
    model.reviewerDepartmentDecisionInfo = AdminResult.createInstance(model.reviewerDepartmentDecisionInfo);


    return model;
  }
}
