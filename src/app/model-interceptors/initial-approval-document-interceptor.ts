import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {InitialExternalOfficeApprovalResult} from "@app/models/initial-external-office-approval-result";
import {AdminResult} from "@app/models/admin-result";

export class InitialApprovalDocumentInterceptor implements IModelInterceptor<InitialExternalOfficeApprovalResult> {
  receive(model: InitialExternalOfficeApprovalResult): InitialExternalOfficeApprovalResult {
    model.countryInfo = AdminResult.createInstance(model.countryInfo);
    model.licenseStatusInfo = AdminResult.createInstance(model.licenseStatusInfo);
    model.ouInfo = AdminResult.createInstance(model.ouInfo);
    model.creatorInfo = AdminResult.createInstance(model.creatorInfo);
    // model.regionInfo = AdminResult.createInstance(model.regionInfo);
    return model;
  }

  send(model: Partial<InitialExternalOfficeApprovalResult>): Partial<InitialExternalOfficeApprovalResult> {
    delete model.countryInfo;
    delete model.licenseStatusInfo;
    delete model.ouInfo;
    delete model.creatorInfo;
    // delete model.regionInfo;
    return model;
  }
}
