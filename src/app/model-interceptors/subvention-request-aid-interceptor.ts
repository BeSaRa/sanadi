import {SubventionRequestAid} from '../models/subvention-request-aid';
import {AdminResult} from '../models/admin-result';
import {DateUtils} from '../helpers/date-utils';

export class SubventionRequestAidInterceptor {
  static receive(model: SubventionRequestAid): SubventionRequestAid {
    model.orgBranchInfo = AdminResult.createInstance(model.orgBranchInfo);
    model.orgUserInfo = AdminResult.createInstance(model.orgUserInfo);
    model.orgInfo = AdminResult.createInstance(model.orgInfo);
    model.statusInfo = AdminResult.createInstance(model.statusInfo);
    model.aids = model.aids.map((aid) => {
      aid.aidLookupInfo = AdminResult.createInstance(aid.aidLookupInfo);
      if (aid.aidAmount) {
        model.aidCount += 1;
      }
      return aid;
    });
    model.creationDateString = model.creationDate ? DateUtils.getDateStringFromDate(model.creationDate, 'DEFAULT_DATE_FORMAT') : '';
    model.statusDateModifiedString = model.statusDateModified ? DateUtils.getDateStringFromDate(model.statusDateModified, 'DEFAULT_DATE_FORMAT') : '';

    return model;
  }

  static send(model: SubventionRequestAid | any): (SubventionRequestAid | any) {
    delete model.subventionRequestService;
    delete model.creationDateString;
    delete model.aidCount;
    delete model.statusDateModifiedString;
    delete model.searchFields;
    delete model.searchFieldsInquiry;
    delete model.searchFieldsSearch;
    return model;
  }
}
