import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {CharityOrganizationProfileExtraData} from '@app/models/charity-organization-profile-extra-data';
import {DateUtils} from '@helpers/date-utils';
import {FactoryService} from '@services/factory.service';
import {Officer} from '@app/models/officer';
import {CharityOrganizationProfileExtraDataService} from '@services/charity-organization-profile-extra-data.service';

export class CharityOrganizationProfileExtraDataInterceptor implements IModelInterceptor<CharityOrganizationProfileExtraData> {
  caseInterceptor?: IModelInterceptor<CharityOrganizationProfileExtraData> | undefined;

  send(model: Partial<CharityOrganizationProfileExtraData>): Partial<CharityOrganizationProfileExtraData> {
    return model;
  }

  receive(model: CharityOrganizationProfileExtraData): CharityOrganizationProfileExtraData {
    let charityOrganizationProfileExtraDataService = FactoryService.getService<CharityOrganizationProfileExtraDataService>('CharityOrganizationProfileExtraDataService');
    model.establishmentDate = DateUtils.getDateStringFromDate(model.establishmentDate);
    model.registrationDate = DateUtils.getDateStringFromDate(model.registrationDate);
    model.publishDate = DateUtils.getDateStringFromDate(model.publishDate);
    model.contactOfficer = model.contactOfficer ? model.contactOfficer.map((x: any) => charityOrganizationProfileExtraDataService.officerInterceptor.receive(new Officer().clone(x))) : [];
    model.complianceOfficer = model.complianceOfficer ? model.complianceOfficer.map((x: any) => charityOrganizationProfileExtraDataService.officerInterceptor.receive(new Officer().clone(x))) : [];
    return model;
  }
}
