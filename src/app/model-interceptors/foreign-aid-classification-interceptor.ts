import { AdminResult } from '@app/models/admin-result';
import { ForeignAidClassification } from '@app/models/foreign-aid-classification';
import { IModelInterceptor } from '@contracts/i-model-interceptor';

export class ForeignAidClassificationInterceptor implements IModelInterceptor<ForeignAidClassification> {
  receive(model: ForeignAidClassification): ForeignAidClassification {
    model.aidClassificationInfo = AdminResult.createInstance(model.aidClassificationInfo);
    model.governanceDomainInfo = AdminResult.createInstance(model.governanceDomainInfo);
    model.mainDACCategoryInfo = AdminResult.createInstance(model.mainDACCategoryInfo);
    model.subUNOCHACategoryInfo = AdminResult.createInstance(model.subUNOCHACategoryInfo);
    model.subDACCategoryInfo = AdminResult.createInstance(model.subDACCategoryInfo);
    model.subUNOCHACategoryInfo = AdminResult.createInstance(model.subUNOCHACategoryInfo);
    model.domainInfo = AdminResult.createInstance(model.domainInfo);
    model.mainDACInfo = AdminResult.createInstance(model.mainDACInfo);
    model.subDACInfo = AdminResult.createInstance(model.subDACInfo);
    model.subUNOCHAInfo = AdminResult.createInstance(model.subUNOCHAInfo);
    model.mainUNOCHAInfo = AdminResult.createInstance(model.mainUNOCHAInfo);
    model.mainUNOCHACategoryInfo = AdminResult.createInstance(model.mainUNOCHACategoryInfo);
    return model;
  }

  send(model: Partial<ForeignAidClassification>): Partial<ForeignAidClassification> {
    delete model.aidClassificationInfo;
    delete model.governanceDomainInfo;
    delete model.mainDACCategoryInfo;
    delete model.mainUNOCHACategoryInfo;
    delete model.subDACCategoryInfo;
    delete model.subUNOCHACategoryInfo;
    delete model.domainInfo;
    delete model.subDACInfo;
    delete model.subUNOCHAInfo;
    delete model.mainDACInfo;
    delete model.mainUNOCHAInfo;
    delete model.auditOperation;
    return model;
  }
}
