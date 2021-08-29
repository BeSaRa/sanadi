import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {InitialExternalOfficeApproval} from "@app/models/initial-external-office-approval";

export class InitialExternalOfficeApprovalInterceptor implements IModelInterceptor<InitialExternalOfficeApproval> {
  send(model: Partial<InitialExternalOfficeApproval>): Partial<InitialExternalOfficeApproval> {
    delete model.service;
    delete model.employeeService;
    return model;
  }

  receive(model: InitialExternalOfficeApproval): InitialExternalOfficeApproval {
    return model;
  }
}
