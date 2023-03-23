import { DateUtils } from '@app/helpers/date-utils';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { CharityBranch } from '@app/models/charity-branch';
import { CharityOrganization } from '@app/models/charity-organization';
import { CharityBranchInterceptor } from './charity-branch-interceptor';
import { OrganizationOfficerInterceptor } from './organization-officer-interceptor';
import { ProfileInterceptor } from './profile-interceptor';

export class CharityOrganizationInterceptor implements IModelInterceptor<CharityOrganization>{
  caseInterceptor?: IModelInterceptor<CharityOrganization> | undefined;
  send(model: Partial<CharityOrganization>): Partial<CharityOrganization> {
    delete model.searchFields;
    delete model.service;
    delete model.langService;
    delete model.profileInfo;
    return model;
  }
  receive(model: CharityOrganization): CharityOrganization {
    const organizationOfficersInterceptor = new OrganizationOfficerInterceptor();
    const charityBranchInterceptor = new CharityBranchInterceptor();
    (model.profileInfo && (model.profileInfo = new ProfileInterceptor().receive(model.profileInfo)));
    model.statusDateModified = DateUtils.getDateStringFromDate(model.statusDateModified);
    model.publishDate = DateUtils.getDateStringFromDate(model.publishDate);
    model.registrationDate = DateUtils.getDateStringFromDate(model.registrationDate);
    model.establishmentDate = DateUtils.getDateStringFromDate(model.establishmentDate);
    model.branchList = model.branchList?.map(E => charityBranchInterceptor.receive(E));
    model.complianceOfficerList = model.complianceOfficerList?.map(e => organizationOfficersInterceptor.receive(e));
    model.contactOfficerList = model.contactOfficerList?.map(e => organizationOfficersInterceptor.receive(e));
    return model;
  }
}
