import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {InternationalCooperation} from '../models/international-cooperation';
import {AdminResult} from '../models/admin-result';

export class InternationalCooperationInterceptor implements IModelInterceptor<InternationalCooperation> {
  send(model: any) {
    delete model.service;
    delete model.taskDetails;
    delete model.caseStatusInfo;
    delete model.creatorInfo;
    delete model.categoryInfo;
    return model;
  }

  receive(model: InternationalCooperation): InternationalCooperation {
    model.caseStatusInfo = AdminResult.createInstance(model.caseStatusInfo);
    model.creatorInfo = AdminResult.createInstance(model.creatorInfo);
    model.categoryInfo = AdminResult.createInstance(model.categoryInfo);
    return model;
  }
}
