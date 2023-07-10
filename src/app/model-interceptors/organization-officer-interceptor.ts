import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { OrganizationOfficer } from '../models/organization-officer';

export class OrganizationOfficerInterceptor implements IModelInterceptor<OrganizationOfficer> {
  caseInterceptor?: IModelInterceptor<OrganizationOfficer> | undefined;
  send(model: Partial<OrganizationOfficer>): Partial<OrganizationOfficer> {
    delete model.searchFields;
    delete model.langService;
    delete model.ouInfo;
    delete model.branchInfo;
    delete model.id;

    return model;

  }
  receive(model: OrganizationOfficer): OrganizationOfficer {
    model.identificationNumber ??= model.qid;
    model.officerId = model.id;
    return model;
  }

}
