import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {CharityOrganizationProfileExtraData} from '@app/models/charity-organization-profile-extra-data';
import {DateUtils} from '@helpers/date-utils';

export class CharityOrganizationProfileExtraDataInterceptor implements IModelInterceptor<CharityOrganizationProfileExtraData> {
  caseInterceptor?: IModelInterceptor<CharityOrganizationProfileExtraData> | undefined;

  send(model: Partial<CharityOrganizationProfileExtraData>): Partial<CharityOrganizationProfileExtraData> {
    return model;
  }

  receive(model: CharityOrganizationProfileExtraData): CharityOrganizationProfileExtraData {
    model.establishmentDate = DateUtils.getDateStringFromDate(model.establishmentDate);
    model.registrationDate = DateUtils.getDateStringFromDate(model.registrationDate);
    model.publishDate = DateUtils.getDateStringFromDate(model.publishDate);
    return model;
  }
}
