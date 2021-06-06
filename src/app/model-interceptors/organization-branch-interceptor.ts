import {OrgBranch} from '../models/org-branch';
import {DateUtils} from '../helpers/date-utils';

export class OrganizationBranchInterceptor {
  static receive(model: OrgBranch | any): (OrgBranch | any) {
    model.statusDateModifiedString = model.statusDateModified ? DateUtils.getDateStringFromDate(model.statusDateModified, 'DEFAULT_DATE_FORMAT') : '';
    return model;
  }

  static send(model: OrgBranch | any): (OrgBranch | any) {
    delete model.service;
    delete model.langService;
    delete model.lookupService;
    delete model.searchFields;
    delete model.statusDateModifiedString;
    return model;
  }
}
