import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {CollectorApproval} from '@app/models/collector-approval';
import {CollectorItemInterceptor} from '@app/model-interceptors/collector-item-interceptor';
import {CollectorItem} from '@app/models/collector-item';
import {TaskDetails} from '@app/models/task-details';
import {AdminResult} from '@app/models/admin-result';

const itemInterceptor = new CollectorItemInterceptor();

export class CollectorApprovalInterceptor implements IModelInterceptor<CollectorApproval> {
  receive(model: CollectorApproval): CollectorApproval {
    model.taskDetails = (new TaskDetails().clone(model.taskDetails));
    model.collectorItemList = model.collectorItemList.map(item => {
      return itemInterceptor.receive(new CollectorItem().clone<CollectorItem>(item));
    });
    model.managerDecisionInfo = AdminResult.createInstance(model.managerDecisionInfo);
    model.reviewerDepartmentDecisionInfo = AdminResult.createInstance(model.reviewerDepartmentDecisionInfo);
    model.specialistDecisionInfo = AdminResult.createInstance(model.specialistDecisionInfo);
    model.secondSpecialistDecisionInfo = AdminResult.createInstance(model.secondSpecialistDecisionInfo);
    model.chiefDecisionInfo = AdminResult.createInstance(model.chiefDecisionInfo);
    model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo);
    model.requestClassificationInfo = AdminResult.createInstance(model.requestClassificationInfo);
    model.licenseDurationTypeInfo = AdminResult.createInstance(model.licenseDurationTypeInfo);
    return model;
  }

  send(model: Partial<CollectorApproval>): Partial<CollectorApproval> {
    model.collectorItemList && (model.collectorItemList = model.collectorItemList.map((item) => {
      return itemInterceptor.send(item) as unknown as CollectorItem;
    }));

    delete model.managerDecisionInfo;
    delete model.reviewerDepartmentDecisionInfo;
    delete model.specialistDecisionInfo;
    delete model.secondSpecialistDecisionInfo;
    delete model.chiefDecisionInfo;
    delete model.requestTypeInfo;
    delete model.requestClassificationInfo;
    delete model.licenseDurationTypeInfo;
    delete model.taskDetails;
    console.log('collector approval', model);
    return model;
  }
}
