import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { ProfileInterceptor } from '@app/model-interceptors/profile-interceptor';
import { FactoryService } from '@app/services/factory.service';
import { ProfileService } from '@app/services/profile.service';
import { IMyDateModel } from 'angular-mydatepicker';
import { BaseModel } from './base-model';
import { ProfielDetails } from './profile-details';

const { receive, send } = new ProfileInterceptor();

@InterceptModel({
  receive,
  send
})
export class Profile extends BaseModel<Profile, ProfileService> {
  service: ProfileService = FactoryService.getService('ProfileService');
  arDesc!: string;
  enDesc!: string;
  profileCode!: string;
  registrationAuthority!: number;
  status!: number;
  statusDateModified!: string | IMyDateModel;
  email!: string;
  profileDetails!: ProfielDetails;

}
