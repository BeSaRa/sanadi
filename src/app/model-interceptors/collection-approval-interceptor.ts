import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {CollectionApproval} from "@app/models/collection-approval";
import {AdminResult} from "@app/models/admin-result";
import {TaskDetails} from "@app/models/task-details";
import {CollectionItem} from "@app/models/collection-item";
import {CollectionItemInterceptor} from "@app/model-interceptors/collection-item-interceptor";

const itemInterceptor = new CollectionItemInterceptor();

export class CollectionApprovalInterceptor implements IModelInterceptor<CollectionApproval> {

  send(model: Partial<CollectionApproval>): Partial<CollectionApproval> {
    model.collectionItemList && (model.collectionItemList = model.collectionItemList.map((item) => {
      return itemInterceptor.send(item) as unknown as CollectionItem
    }))
    delete model.managerDecisionInfo
    delete model.reviewerDepartmentDecisionInfo
    delete model.specialistDecisionInfo
    delete model.secondSpecialistDecisionInfo
    delete model.chiefDecisionInfo
    delete model.requestTypeInfo
    delete model.requestClassificationInfo
    delete model.licenseDurationTypeInfo
    delete model.taskDetails;
    return model;
  }

  receive(model: CollectionApproval): CollectionApproval {
    model.taskDetails = (new TaskDetails().clone(model.taskDetails))
    model.collectionItemList = model.collectionItemList.map(item => {
      return itemInterceptor.receive(new CollectionItem().clone(item));
    })
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
