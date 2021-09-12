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

    return model;
  }

  receive(model: InitialExternalOfficeApproval): InitialExternalOfficeApproval {
    model.taskDetails = (new TaskDetails()).clone(model.taskDetails);
    model.caseStatusInfo = AdminResult.createInstance(model.caseStatusInfo);
    model.creatorInfo = AdminResult.createInstance(model.creatorInfo);
    model.ouInfo = AdminResult.createInstance(model.ouInfo);

    return model;
  }
}
