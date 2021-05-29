import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {AdminResult} from '../models/admin-result';
import {Recommendation} from '../models/recommendation';

export class RecommendationInterceptor implements IModelInterceptor<Recommendation> {
  receive(model: Recommendation): Recommendation {
    model.creatorInfo = AdminResult.createInstance(model.creatorInfo);
    model.ouInfo = AdminResult.createInstance(model.ouInfo);
    return model;
  }

  send(model: any): any {
    delete model.creatorInfo;
    delete model.ouInfo;
    return model;
  }
}
