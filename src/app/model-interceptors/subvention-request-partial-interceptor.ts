import { AdminResult } from '../models/admin-result';
import { SubventionRequestPartial } from '../models/subvention-request-partial';
import { DateUtils } from '@helpers/date-utils';

export class SubventionRequestPartialInterceptor {
  receive(model: SubventionRequestPartial): SubventionRequestPartial {
    model.orgBranchInfo = AdminResult.createInstance(model.orgBranchInfo);
    model.orgInfo = AdminResult.createInstance(model.orgInfo);
    model.statusInfo = AdminResult.createInstance(model.statusInfo);
    model.genderInfo = AdminResult.createInstance(model.genderInfo);

    model.creationDateString = DateUtils.getDateStringFromDate(model.creationDate);
    return model;
  }

  send(model: any | SubventionRequestPartial): any {
    delete model.subventionRequestPartialService;
    delete model.orgBranchInfo;
    delete model.orgInfo;
    delete model.statusInfo;
    delete model.genderInfo;
    delete model.creationDateString;
    delete model.searchFields;
    return model;
  }
}
