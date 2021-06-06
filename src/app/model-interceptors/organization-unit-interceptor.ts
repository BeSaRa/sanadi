import {OrgUnit} from '../models/org-unit';
import {hasValidLength, isValidValue} from '../helpers/utils';
import {changeDateFromDatepicker, changeDateToDatepicker, getDateStringFromDate} from '../helpers/utils-date';

export class OrganizationUnitInterceptor {
  static receive(model: OrgUnit | any): (OrgUnit | any) {
    model.statusDateModifiedString = model.statusDateModified ? getDateStringFromDate(model.statusDateModified, 'DEFAULT_DATE_FORMAT') : '';
    model.registryDate = changeDateToDatepicker(model.registryDate);
    model.establishmentDate = changeDateToDatepicker(model.establishmentDate);
    model.budgetClosureDate = changeDateToDatepicker(model.budgetClosureDate);

    if (isValidValue(model.arabicBoardMembers) && typeof model.arabicBoardMembers === 'string') {
      model.arabicBoardMembers = JSON.parse(model.arabicBoardMembers);
    }
    if (isValidValue(model.enBoardMembers) && typeof model.enBoardMembers === 'string') {
      model.enBoardMembers = JSON.parse(model.enBoardMembers);
    }
    return model;
  }

  static send(model: OrgUnit | any): (OrgUnit | any) {
    // model.registryDate = model.registryDate ? (new Date(model.registryDate)).toISOString() : model.registryDate;
    model.registryDate = model.registryDate ? changeDateFromDatepicker(model.registryDate)?.toISOString() : model.registryDate;
    model.establishmentDate = model.establishmentDate ? changeDateFromDatepicker(model.establishmentDate)?.toISOString() : model.establishmentDate;
    model.budgetClosureDate = model.budgetClosureDate ? changeDateFromDatepicker(model.budgetClosureDate)?.toISOString() : model.budgetClosureDate;
    if (hasValidLength(model.arabicBoardMembers) && model.arabicBoardMembers.length > 0) {
      model.arabicBoardMembers = JSON.stringify(model.arabicBoardMembers);
    } else {
      model.arabicBoardMembers = JSON.stringify([]);
    }

    if (hasValidLength(model.enBoardMembers) && model.enBoardMembers.length > 0) {
      model.enBoardMembers = JSON.stringify(model.enBoardMembers);
    } else {
      model.enBoardMembers = JSON.stringify([]);
    }

    delete model.service;
    delete model.langService;
    delete model.lookupService;
    delete model.searchFields;
    delete model.statusDateModifiedString;
    return model;
  }
}
