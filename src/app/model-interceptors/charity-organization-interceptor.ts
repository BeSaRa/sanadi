import { DateUtils } from '@app/helpers/date-utils';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { CharityBranch } from '@app/models/charity-branch';
import { CharityOrganization } from '@app/models/charity-organization';
import { OrganizationOfficer } from '@app/models/organization-officer';
import { CharityBranchInterceptor } from './charity-branch-interceptor';
import { OrganizationOfficerInterceptor } from './organization-officer-interceptor';
import { ProfileInterceptor } from './profile-interceptor';
import { AdminResult } from '@app/models/admin-result';
import { Profile } from '@app/models/profile';

const organizationOfficersInterceptor = new OrganizationOfficerInterceptor();
const charityBranchInterceptor = new CharityBranchInterceptor();
export class CharityOrganizationInterceptor implements IModelInterceptor<CharityOrganization>{
  caseInterceptor?: IModelInterceptor<CharityOrganization> | undefined;
  send(model: Partial<CharityOrganization>): Partial<CharityOrganization> {
    delete model.searchFields;
    delete model.service;
    delete model.langService;
    delete model.profileInfo;
    delete model.statusInfo;
    delete model.activityTypeInfo;
    return model;
  }
  receive(model: CharityOrganization): CharityOrganization {
    (model.profileInfo && (model.profileInfo = new ProfileInterceptor().receive(new Profile().clone(model.profileInfo))));
    model.statusInfo && (model.statusInfo = AdminResult.createInstance(model.statusInfo??{}));
    model.activityTypeInfo && (model.activityTypeInfo = AdminResult.createInstance(model.activityTypeInfo??{}));
    model.statusDateModified = DateUtils.getDateStringFromDate(model.statusDateModified);
    model.publishDate = DateUtils.getDateStringFromDate(model.publishDate);
    model.registrationDate = DateUtils.getDateStringFromDate(model.registrationDate);
    model.establishmentDate = DateUtils.getDateStringFromDate(model.establishmentDate);
    model.branchList = model.branchList?.map(e => charityBranchInterceptor.receive(new CharityBranch().clone(e)));
    model.complianceOfficerList = model.complianceOfficerList?.map(e => organizationOfficersInterceptor.receive(new OrganizationOfficer().clone(e)));
    model.contactOfficerList = model.contactOfficerList?.map(e => organizationOfficersInterceptor.receive(new OrganizationOfficer().clone(e)));
    return model;
  }
}
