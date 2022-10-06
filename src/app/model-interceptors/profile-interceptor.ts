import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { AdminResult } from '@app/models/admin-result';
import { Profile } from '@app/models/profile';

export class ProfileInterceptor implements IModelInterceptor<Profile> {
  caseInterceptor?: IModelInterceptor<Profile> | undefined;
  send(model: Partial<Profile>): Partial<Profile> {
    delete model.service;
    delete model.statusInfo;
    return model;
  }
  receive(model: Profile): Profile {
    model.statusInfo = AdminResult.createInstance(model.statusInfo);
    return model;
  }
}
