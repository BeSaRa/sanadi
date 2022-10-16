import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { ProfileServiceInterceptor } from '@app/model-interceptors/profile-service-interceptor';
import { FactoryService } from '@app/services/factory.service';
import { ProfileServiceService } from '@app/services/profile-service.service';
import { BaseModel } from './base-model';

const { receive, send } = new ProfileServiceInterceptor();

@InterceptModel({
  receive,
  send,
})
export class ProfileService extends BaseModel<ProfileService, ProfileServiceService> {
  service: ProfileServiceService = FactoryService.getService('ProfileServiceService');
  serviceId!: number;
  profileId!: number;
}
