import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {CollectionLicense} from "@app/license-models/collection-license";
import {AdminResult} from "@app/models/admin-result";

export class CollectionLicenseInterceptor implements IModelInterceptor<CollectionLicense> {
  send(model: Partial<CollectionLicense>): Partial<CollectionLicense> {
    return model;
  }

  receive(model: CollectionLicense): CollectionLicense {
    model.caseStatusInfo && (model.caseStatusInfo = AdminResult.createInstance(model.caseStatusInfo))
    model.chiefDecisionInfo && (model.chiefDecisionInfo = AdminResult.createInstance(model.chiefDecisionInfo))
    model.licenseDurationTypeInfo && (model.licenseDurationTypeInfo = AdminResult.createInstance(model.licenseDurationTypeInfo))
    model.licenseStatusInfo && (model.licenseStatusInfo = AdminResult.createInstance(model.licenseStatusInfo))
    model.managerDecisionInfo && (model.managerDecisionInfo = AdminResult.createInstance(model.managerDecisionInfo))
    model.orgInfo && (model.orgInfo = AdminResult.createInstance(model.orgInfo))
    model.requestClassificationInfo && (model.requestClassificationInfo = AdminResult.createInstance(model.requestClassificationInfo))
    model.requestTypeInfo && (model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo))
    model.reviewerDepartmentDecisionInfo && (model.reviewerDepartmentDecisionInfo = AdminResult.createInstance(model.reviewerDepartmentDecisionInfo))
    model.secondSpecialistDecisionInfo && (model.secondSpecialistDecisionInfo = AdminResult.createInstance(model.secondSpecialistDecisionInfo))
    model.specialistDecisionInfo && (model.specialistDecisionInfo = AdminResult.createInstance(model.specialistDecisionInfo))
    return model;
  }
}
