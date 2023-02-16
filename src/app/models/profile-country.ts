import { ProfileCountryInterceptor } from './../model-interceptors/profile-country-interceptor';
import { AdminResult } from './admin-result';
import { ProfileCountryService } from './../services/profile-country.service';
import { FactoryService } from '@app/services/factory.service';
import { BaseModel } from './base-model';
import { InterceptModel } from '@app/decorators/decorators/intercept-model';
const { send, receive } = new ProfileCountryInterceptor();

@InterceptModel({ send, receive })
export class ProfileCountry extends BaseModel<ProfileCountry, ProfileCountryService> {
  service: ProfileCountryService;
  id!: number;
  profileId!: number;
  countryId!: number;
  countryInfo!: AdminResult;
  constructor() {
    super();
    this.service = FactoryService.getService('ProfileCountryService');
  };
}
