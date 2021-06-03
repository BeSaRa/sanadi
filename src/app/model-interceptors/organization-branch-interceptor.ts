import {OrgBranch} from '../models/org-branch';
import {FactoryService} from '../services/factory.service';
import {DatePipe} from '@angular/common';

export class OrganizationBranchInterceptor {
  static receive(model: OrgBranch | any): (OrgBranch | any) {
    model.statusDateModifiedString = '';
    if (model.statusDateModified) {
      const configurationService = FactoryService.getService('ConfigurationService');
      // @ts-ignore
      model.statusDateModifiedString = new DatePipe('en-US').transform(model.statusDateModified, configurationService.CONFIG.DEFAULT_DATE_FORMAT);
    }
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
