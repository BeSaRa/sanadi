import { DateUtils } from '@app/helpers/date-utils';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { CharityBranch } from '@app/models/charity-branch';
import { CharityOrganization } from '@app/models/charity-organization';
import { OrganizationOfficerInterceptor } from './organization-officer-interceptor';

export class CharityOrganizationInterceptor implements IModelInterceptor<CharityOrganization>{
  caseInterceptor?: IModelInterceptor<CharityOrganization> | undefined;
  send(model: Partial<CharityOrganization>): Partial<CharityOrganization> {
    return model;
  }
  receive(model: CharityOrganization): CharityOrganization {
    const organizationOfficersInterceptor = new OrganizationOfficerInterceptor();
    model.statusDateModified = DateUtils.getDateStringFromDate(model.statusDateModified);
    model.publishDate = DateUtils.getDateStringFromDate(model.publishDate);
    model.registrationDate = DateUtils.getDateStringFromDate(model.registrationDate);
    model.establishmentDate = DateUtils.getDateStringFromDate(model.establishmentDate);
    model.branchList = model.branchList.map(E => new CharityBranch().clone({ ...E }));
    model.complianceOfficer = model.complianceOfficer?.map(e => organizationOfficersInterceptor.receive(e));
    model.contactOfficer = model.contactOfficer?.map(e => organizationOfficersInterceptor.receive(e));
    return model;
  }
}
