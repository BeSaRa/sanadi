import {FactoryService} from '../services/factory.service';
import {DatePipe, formatDate} from '@angular/common';
import {OrgUnit} from '../models/org-unit';
import {changeDateFromDatepicker, changeDateToDatepicker, isValidValue} from '../helpers/utils';
import {ConfigurationService} from '../services/configuration.service';

export function interceptOrganizationUnit(model: OrgUnit | any): (OrgUnit | any) {
  // model.registryDate = model.registryDate ? (new Date(model.registryDate)).toISOString() : model.registryDate;
  model.registryDate = model.registryDate ? changeDateFromDatepicker(model.registryDate)?.toISOString() : model.registryDate;
  model.establishmentDate = model.establishmentDate ? changeDateFromDatepicker(model.establishmentDate)?.toISOString() : model.establishmentDate;
  model.budgetClosureDate = model.budgetClosureDate ? changeDateFromDatepicker(model.budgetClosureDate)?.toISOString() : model.budgetClosureDate;

  model.arabicBoardMembers = JSON.stringify(model.arabicBoardMembers);
  model.enBoardMembers = JSON.stringify(model.enBoardMembers);

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
    const configurationService = FactoryService.getService<ConfigurationService>('ConfigurationService');
    model.statusDateModifiedString = new DatePipe('en-US').transform(model.statusDateModified, configurationService.CONFIG.DEFAULT_DATE_FORMAT);
  }
  // model.registryDate = model.registryDate ? formatDate(new Date(model.registryDate), 'yyyy-MM-dd', 'en-US') : model.registryDate;

  model.registryDate = changeDateToDatepicker(model.registryDate);
  model.establishmentDate = changeDateToDatepicker(model.establishmentDate);
  model.budgetClosureDate = changeDateToDatepicker(model.budgetClosureDate);

  if (isValidValue(model.arabicBoardMembers)) {
    model.arabicBoardMembers = JSON.parse(model.arabicBoardMembers);
  }
  if (isValidValue(model.enBoardMembers)) {
    model.enBoardMembers = JSON.parse(model.enBoardMembers);
  }
  return model;
}
