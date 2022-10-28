import {BaseModel} from '@app/models/base-model';
import {CharityOrganizationProfileExtraDataService} from '@services/charity-organization-profile-extra-data.service';
import {FactoryService} from '@services/factory.service';
import {InterceptModel} from '@decorators/intercept-model';
import {CharityOrganizationProfileExtraDataInterceptor} from '@app/model-interceptors/charity-organization-profile-extra-data-interceptor';

const {receive, send} = new CharityOrganizationProfileExtraDataInterceptor();

@InterceptModel({
  receive,
  send,
})
export class CharityOrganizationProfileExtraData extends BaseModel<CharityOrganizationProfileExtraData, CharityOrganizationProfileExtraDataService> {
  service: CharityOrganizationProfileExtraDataService = FactoryService.getService('CharityOrganizationProfileExtraDataService');
}
