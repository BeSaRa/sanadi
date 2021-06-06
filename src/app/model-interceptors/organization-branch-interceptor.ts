import {OrgBranch} from '../models/org-branch';
import {getDateStringFromDate} from '../helpers/utils-date';

export class OrganizationBranchInterceptor {
  static receive(model: OrgBranch | any): (OrgBranch | any) {
    model.statusDateModifiedString = model.statusDateModified ? getDateStringFromDate(model.statusDateModified, 'DEFAULT_DATE_FORMAT') : '';
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
