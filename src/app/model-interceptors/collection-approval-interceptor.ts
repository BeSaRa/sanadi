import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {CollectionApproval} from "@app/models/collection-approval";
import {AdminResult} from "@app/models/admin-result";

export class CollectionApprovalInterceptor implements IModelInterceptor<CollectionApproval> {
  send(model: Partial<CollectionApproval>): Partial<CollectionApproval> {
    delete model.managerDecisionInfo
    delete model.reviewerDepartmentDecisionInfo
    delete model.specialistDecisionInfo
    delete model.secondSpecialistDecisionInfo
    delete model.chiefDecisionInfo
    delete model.requestTypeInfo
    delete model.requestClassificationInfo
    delete model.licenseDurationTypeInfo
    return model;
  }

  receive(model: CollectionApproval): CollectionApproval {
    model.managerDecisionInfo = AdminResult.createInstance(model.managerDecisionInfo)
    model.reviewerDepartmentDecisionInfo = AdminResult.createInstance(model.reviewerDepartmentDecisionInfo)
    model.specialistDecisionInfo = AdminResult.createInstance(model.specialistDecisionInfo)
    model.secondSpecialistDecisionInfo = AdminResult.createInstance(model.secondSpecialistDecisionInfo)
    model.chiefDecisionInfo = AdminResult.createInstance(model.chiefDecisionInfo)
    model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo)
    model.requestClassificationInfo = AdminResult.createInstance(model.requestClassificationInfo)
    model.licenseDurationTypeInfo = AdminResult.createInstance(model.licenseDurationTypeInfo)
    return model;
  }
}
