import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {SubventionAid} from '../models/subvention-aid';

export class SubventionAidInterceptor implements IModelInterceptor<SubventionAid> {
  receive(model: SubventionAid): SubventionAid {
    return model;
  }

  send(model: any): any {
    delete model.service;
    return model;
  }


}
