import {OrgBranch} from '../models/org-branch';
import {FactoryService} from '../services/factory.service';
import {DatePipe} from '@angular/common';

export function interceptOrganizationBranch(model: any): any {
  delete model.service;
  delete model.langService;
  delete model.lookupService;
  delete model.searchFields;
  delete model.statusDateModifiedString;
  return model;
}

export function interceptOrganizationBranchReceive(model: OrgBranch | any): (OrgBranch | any) {
  model.statusDateModifiedString = '';
  if (model.statusDateModified) {
    const configurationService = FactoryService.getService('ConfigurationService');
    // @ts-ignore
    model.statusDateModifiedString = new DatePipe('en-US').transform(model.statusDateModified, configurationService.CONFIG.DEFAULT_DATE_FORMAT);
  }
  return model;
}
