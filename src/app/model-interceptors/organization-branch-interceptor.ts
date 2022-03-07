import {OrgBranch} from '../models/org-branch';
import {DateUtils} from '../helpers/date-utils';
import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';

export class OrganizationBranchInterceptor implements IModelInterceptor<OrgBranch> {
  receive(model: OrgBranch | any): (OrgBranch | any) {
    model.statusDateModifiedString = model.statusDateModified ? DateUtils.getDateStringFromDate(model.statusDateModified, 'DEFAULT_DATE_FORMAT') : '';
    return model;
  }

  send(model: OrgBranch | any): (OrgBranch | any) {
    OrganizationBranchInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<OrgBranch> | any): void {
    delete model.service;
    delete model.langService;
    delete model.lookupService;
    delete model.searchFields;
    delete model.statusDateModifiedString;
  }
}
