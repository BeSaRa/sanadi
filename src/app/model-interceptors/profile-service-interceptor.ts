import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { AdminResult } from '@app/models/admin-result';
import { ProfileService } from '@app/models/profile-service';

export class ProfileServiceInterceptor implements IModelInterceptor<ProfileService> {
  caseInterceptor?: IModelInterceptor<ProfileService> | undefined;
  send(model: Partial<ProfileService>): Partial<ProfileService> {
    return model;
  }
  receive(model: ProfileService): ProfileService {
    return model;
  }
}
