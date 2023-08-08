import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { CharityBranch } from '@app/models/charity-branch';
import { OrganizationOfficer } from '@app/models/organization-officer';
import { OrganizationOfficerInterceptor } from './organization-officer-interceptor';
import { isValidAdminResult } from '@app/helpers/utils';
import { AdminResult } from '@app/models/admin-result';

export class CharityBranchInterceptor implements IModelInterceptor<CharityBranch>{
  caseInterceptor?: IModelInterceptor<CharityBranch> | undefined;
  send(model: Partial<CharityBranch>): Partial<CharityBranch> {
    delete model.searchFields;
    delete model.branchContactOfficerList;
    delete model.auditOperation;
    delete model.categoryInfo;
    delete model.usageAdjectiveInfo;
    delete model.branchAdjectiveInfo;
    delete model.id;
    delete model.status;
    delete model.statusInfo;
    const organizationOfficerInterceptor = new OrganizationOfficerInterceptor();
    model.branchContactOfficer = (model.branchContactOfficer || model.branchContactOfficerList || []).map(e => {
      e.itemId = !e.itemId ? e.id?.toString() : e.itemId;
      model.branchId && (e.branchId = model.branchId);
      return organizationOfficerInterceptor.send(e) as OrganizationOfficer;
    });
    return model;
  }
  receive(model: CharityBranch): CharityBranch {
    const organizationOfficerInterceptor = new OrganizationOfficerInterceptor();
    model.branchContactOfficer = (model.branchContactOfficer || model.branchContactOfficerList || []).map(e => organizationOfficerInterceptor.receive(e));
    model.branchContactOfficerList = (model.branchContactOfficer || model.branchContactOfficerList || []).map(e => organizationOfficerInterceptor.receive(e));
    model.categoryInfo = AdminResult.createInstance(isValidAdminResult(model.categoryInfo) ? model.categoryInfo : {});
    model.branchAdjectiveInfo = AdminResult.createInstance(isValidAdminResult(model.branchAdjectiveInfo) ? model.branchAdjectiveInfo : {});
    model.usageAdjectiveInfo = AdminResult.createInstance(isValidAdminResult(model.usageAdjectiveInfo) ? model.usageAdjectiveInfo : {});
    model.branchId = model.id
    return model;
  }
}
