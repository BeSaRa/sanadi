import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { CharityBranch } from '@app/models/charity-branch';
import { OrganizationOfficer } from '@app/models/organization-officer';
import { OrganizationOfficerInterceptor } from './organization-officer-interceptor';

export class CharityBranchInterceptor implements IModelInterceptor<CharityBranch>{
  caseInterceptor?: IModelInterceptor<CharityBranch> | undefined;
  send(model: Partial<CharityBranch>): Partial<CharityBranch> {
    delete model.searchFields;
    delete model.branchContactOfficerList;
    delete model.auditOperation;
    const organizationOfficerInterceptor = new OrganizationOfficerInterceptor();
    model.branchContactOfficer = model.branchContactOfficer?.map(e => organizationOfficerInterceptor.send(e) as OrganizationOfficer);
    return model;
  }
  receive(model: CharityBranch): CharityBranch {
    const organizationOfficerInterceptor = new OrganizationOfficerInterceptor();
    model.branchContactOfficer = (model.branchContactOfficer || model.branchContactOfficerList || [])?.map(e => organizationOfficerInterceptor.receive(e));
    return model;
  }
}
