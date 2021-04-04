import {FactoryService} from '../services/factory.service';
import {DatePipe, formatDate} from '@angular/common';
import {OrgUnit} from '../models/org-unit';

export function interceptOrganizationUnit(model: OrgUnit | any): (OrgUnit | any) {
  model.registryDate = model.registryDate ? (new Date(model.registryDate)).toISOString() : model.registryDate;

  delete model.service;
  delete model.langService;
  delete model.lookupService;
  delete model.searchFields;
  delete model.statusDateModifiedString;
  return model;
}

export function interceptOrganizationUnitReceive(model: OrgUnit | any): (OrgUnit | any) {
  model.statusDateModifiedString = '';
  if (model.statusDateModified) {
    const configurationService = FactoryService.getService('ConfigurationService');
    // @ts-ignore
    model.statusDateModifiedString = new DatePipe('en-US').transform(model.statusDateModified, configurationService.CONFIG.DEFAULT_DATE_FORMAT);
  }
  model.registryDate = model.registryDate ? formatDate(new Date(model.registryDate), 'yyyy-MM-dd', 'en-US') : model.registryDate;
  return model;
}
