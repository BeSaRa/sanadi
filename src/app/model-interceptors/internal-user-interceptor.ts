import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {InternalUser} from '../models/internal-user';

export class InternalUserInterceptor implements IModelInterceptor<InternalUser> {
  receive(model: InternalUser): InternalUser {
    return model;
  }

  send(model: any): any {
    return model;
  }
}
