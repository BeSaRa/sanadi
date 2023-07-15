import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { OrganizationOfficer } from '../models/organization-officer';
import { AdminResult } from '@app/models/admin-result';

export class OrganizationOfficerInterceptor implements IModelInterceptor<OrganizationOfficer> {
  caseInterceptor?: IModelInterceptor<OrganizationOfficer> | undefined;
  send(model: Partial<OrganizationOfficer>): Partial<OrganizationOfficer> {
    delete model.searchFields;
    delete model.langService;
    delete model.ouInfo;
    delete model.branchInfo;
    delete model.id;
    delete model.organizationInfo;

    return model;

  }
  receive(model: OrganizationOfficer): OrganizationOfficer {
    model.identificationNumber ??= model.qid;
    model.officerId = model.id;
    model.ouInfo = AdminResult.createInstance(model.ouInfo??{});
    model.organizationInfo = AdminResult.createInstance(model.organizationInfo??{});
    model.branchInfo = AdminResult.createInstance(model.branchInfo??{});
    return model;
  }

}
