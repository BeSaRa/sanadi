import { ProfileCountryService } from './../services/profile-country.service';
import { FactoryService } from '@app/services/factory.service';
import { BaseModel } from './base-model';

export class ProfileCountry extends BaseModel<ProfileCountry, ProfileCountryService> {
  service: ProfileCountryService;
  id!: number;
  profileId!: number;
  countryId!: number
  constructor() {
    super();
    this.service = FactoryService.getService('ProfileCountryService');
  };
}
