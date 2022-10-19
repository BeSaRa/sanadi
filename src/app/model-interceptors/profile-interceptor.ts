import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { AdminResult } from '@app/models/admin-result';
import { Profile } from '@app/models/profile';

export class ProfileInterceptor implements IModelInterceptor<Profile> {
  caseInterceptor?: IModelInterceptor<Profile> | undefined;
  send(model: Partial<Profile>): Partial<Profile> {
    if (model.registrationAuthority === -1) { delete model.registrationAuthority; }
    delete model.service;
    delete model.statusInfo;
    delete model.profileTypeInfo;
    delete model.registrationAuthorityInfo;
    return model;
  }
  receive(model: Profile): Profile {
    model.profileTypeInfo = AdminResult.createInstance(model.profileTypeInfo);
    model.registrationAuthorityInfo = AdminResult.createInstance(model.registrationAuthorityInfo);
    model.statusInfo = AdminResult.createInstance(model.statusInfo);
    return model;
  }
}
