import {AdminResult} from '../models/admin-result';
import {getDateStringFromDate} from '../helpers/utils';
import {SubventionRequestPartial} from '../models/subvention-request-partial';

export class SubventionRequestPartialInterceptor {
  static receive(model: SubventionRequestPartial): SubventionRequestPartial {
    model.orgBranchInfo = AdminResult.createInstance(model.orgBranchInfo);
    model.orgInfo = AdminResult.createInstance(model.orgInfo);
    model.statusInfo = AdminResult.createInstance(model.statusInfo);
    model.benCategoryInfo = AdminResult.createInstance(model.benCategoryInfo);
    model.genderInfo = AdminResult.createInstance(model.genderInfo);
    model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo);

    model.creationDateString = getDateStringFromDate(model.creationDate);
    return model;
  }

  static send(model: any | SubventionRequestPartial): any {
    delete model.subventionRequestPartialService;
    delete model.orgBranchInfo;
    delete model.orgInfo;
    delete model.statusInfo;
    delete model.benCategoryInfo;
    delete model.genderInfo;
    delete model.requestTypeInfo;
    delete model.requestTypeInfo;
    delete model.creationDateString;
    return model;
  }
}
