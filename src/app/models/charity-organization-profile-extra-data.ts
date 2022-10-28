import {BaseModel} from '@app/models/base-model';
import {CharityOrganizationProfileExtraDataService} from '@services/charity-organization-profile-extra-data.service';
import {FactoryService} from '@services/factory.service';

export class CharityOrganizationProfileExtraData extends BaseModel<CharityOrganizationProfileExtraData, CharityOrganizationProfileExtraDataService> {
  service: CharityOrganizationProfileExtraDataService = FactoryService.getService('CharityOrganizationProfileExtraDataService');
}
