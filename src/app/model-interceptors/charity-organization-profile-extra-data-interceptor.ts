import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {CharityOrganizationProfileExtraData} from '@app/models/charity-organization-profile-extra-data';
import {DateUtils} from '@helpers/date-utils';
import {Profile} from '@app/models/profile';
import {AdminResult} from '@app/models/admin-result';
import {BranchInterceptor} from '@app/model-interceptors/branch-interceptor';
import {OfficerInterceptor} from '@app/model-interceptors/officer-interceptor';

export class CharityOrganizationProfileExtraDataInterceptor implements IModelInterceptor<CharityOrganizationProfileExtraData> {
  caseInterceptor?: IModelInterceptor<CharityOrganizationProfileExtraData> | undefined;

  send(model: Partial<CharityOrganizationProfileExtraData>): Partial<CharityOrganizationProfileExtraData> {
    let branchInterceptor = new BranchInterceptor();
    let officerInterceptor = new OfficerInterceptor();
    model.branchList?.map(x => {
      return branchInterceptor.send(x);
    });
    model.contactOfficerList?.map(x => {
      return officerInterceptor.send(x);
    });
    model.complianceOfficerList?.map(x => {
      return officerInterceptor.send(x);
    });
    delete model.profileInfo;
    delete model.service;
    delete model.langService;
    delete model.activityTypeInfo;
    delete model.statusInfo;
    delete model.searchFields;
    return model;
  }

  receive(model: CharityOrganizationProfileExtraData): CharityOrganizationProfileExtraData {
    model.establishmentDate = DateUtils.getDateStringFromDate(model.establishmentDate);
    model.registrationDate = DateUtils.getDateStringFromDate(model.registrationDate);
    model.publishDate = DateUtils.getDateStringFromDate(model.publishDate);

    model.profileInfo = (new Profile()).clone(model.profileInfo);
    model.profileInfo.registrationAuthorityInfo = model?.profileInfo?.registrationAuthorityInfo ? AdminResult.createInstance(model.profileInfo.registrationAuthorityInfo) : AdminResult.createInstance({});
    return model;
  }
}
