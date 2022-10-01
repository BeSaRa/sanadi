import { AdminResult } from '@app/models/admin-result';
import { ForeignAidClassification } from '@app/models/foreign-aid-classification';
import { IModelInterceptor } from '@contracts/i-model-interceptor';

export class ForeignAidClassificationInterceptor implements IModelInterceptor<ForeignAidClassification> {
  receive(model: ForeignAidClassification): ForeignAidClassification {
    model.aidClassificationInfo = AdminResult.createInstance(model.aidClassificationInfo)
    model.governanceDomainInfo = AdminResult.createInstance(model.governanceDomainInfo)
    model.mainDACCategoryInfo = AdminResult.createInstance(model.mainDACCategoryInfo)
    model.mainUNOCHACategoryInfo = AdminResult.createInstance(model.mainUNOCHACategoryInfo)
    model.subDACCategoryInfo = AdminResult.createInstance(model.subDACCategoryInfo)
    model.subUNOCHACategoryInfo = AdminResult.createInstance(model.subUNOCHACategoryInfo)
    return model;
  }

  send(model: Partial<ForeignAidClassification>): Partial<ForeignAidClassification> {
    delete model.aidClassificationInfo
    delete model.governanceDomainInfo
    delete model.mainDACCategoryInfo
    delete model.mainUNOCHACategoryInfo
    delete model.subDACCategoryInfo
    delete model.subUNOCHACategoryInfo
    return model;
  }
}
