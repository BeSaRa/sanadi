import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { Profile } from '@app/models/profile';

export class ProfileInterceptor implements IModelInterceptor<Profile> {
  caseInterceptor?: IModelInterceptor<Profile> | undefined;
  send(model: Partial<Profile>): Partial<Profile> {
    return model;
  }
  receive(model: Profile): Profile {
    return model;
  }
}
