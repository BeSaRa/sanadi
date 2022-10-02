import { AdminResult } from '@app/models/admin-result';
import { ForeignAidClassification } from '@app/models/foreign-aid-classification';
import { IModelInterceptor } from '@contracts/i-model-interceptor';

export class ForeignAidClassificationInterceptor implements IModelInterceptor<ForeignAidClassification> {
  receive(model: ForeignAidClassification): ForeignAidClassification {
    model.aidClassificationInfo = AdminResult.createInstance(model.aidClassificationInfo);
    model.governanceDomainInfo = AdminResult.createInstance(model.governanceDomainInfo);
    model.mainDACInfo = AdminResult.createInstance(model.mainDACInfo);
    model.mainUNOCHAInfo = AdminResult.createInstance(model.mainUNOCHAInfo);
    model.subDACInfo = AdminResult.createInstance(model.subDACInfo);
    model.subUNOCHAInfo = AdminResult.createInstance(model.subUNOCHAInfo);
    return model;
  }

  send(model: Partial<ForeignAidClassification>): Partial<ForeignAidClassification> {
    delete model.aidClassificationInfo;
    delete model.governanceDomainInfo;
    delete model.mainDACInfo;
    delete model.mainUNOCHAInfo;
    delete model.subDACInfo;
    delete model.subUNOCHAInfo;
    return model;
  }
}
