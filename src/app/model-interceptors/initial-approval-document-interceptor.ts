import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {InitialApprovalDocument} from "@app/models/initial-approval-document";
import {AdminResult} from "@app/models/admin-result";

export class InitialApprovalDocumentInterceptor implements IModelInterceptor<InitialApprovalDocument> {
  receive(model: InitialApprovalDocument): InitialApprovalDocument {
    model.countryInfo = AdminResult.createInstance(model.countryInfo);
    model.licenseStatusInfo = AdminResult.createInstance(model.licenseStatusInfo);
    model.ouInfo = AdminResult.createInstance(model.ouInfo);
    model.creatorInfo = AdminResult.createInstance(model.creatorInfo);
    model.regionInfo = AdminResult.createInstance(model.regionInfo);
    return model;
  }

  send(model: Partial<InitialApprovalDocument>): Partial<InitialApprovalDocument> {
    delete model.countryInfo;
    delete model.licenseStatusInfo;
    delete model.ouInfo;
    delete model.creatorInfo;
    delete model.regionInfo;
    return model;
  }
}
