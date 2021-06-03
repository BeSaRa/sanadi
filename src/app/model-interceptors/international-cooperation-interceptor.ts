import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {InternationalCooperation} from '../models/international-cooperation';

export class InternationalCooperationInterceptor implements IModelInterceptor<InternationalCooperation> {
  send(model: any) {
    return model;
  }

  receive(model: InternationalCooperation): InternationalCooperation {
    return model;
  }
}
