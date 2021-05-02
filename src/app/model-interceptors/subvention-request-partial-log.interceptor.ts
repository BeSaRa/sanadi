import {AdminResult} from '../models/admin-result';
import {changeDateFromDatepicker, getDateStringFromDate} from '../helpers/utils';
import {SubventionRequestPartialLog} from '../models/subvention-request-partial-log';

export class SubventionRequestPartialLogInterceptor {
  static receive(model: SubventionRequestPartialLog): SubventionRequestPartialLog {
    model.orgUserInfo = AdminResult.createInstance(model.orgUserInfo);
    model.orgBranchInfo = AdminResult.createInstance(model.orgBranchInfo);
    model.orgInfo = AdminResult.createInstance(model.orgInfo);
    model.actionTypeInfo = AdminResult.createInstance(model.actionTypeInfo);
    model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo);
    model.benCategoryInfo = AdminResult.createInstance(model.benCategoryInfo);

    model.creationDateString = getDateStringFromDate(model.creationDate);
    model.actionDateString = getDateStringFromDate(model.actionTime);
    return model;
  }

  static send(model: any | SubventionRequestPartialLog): any {
    delete model.subventionRequestPartialLogService;
    delete model.orgBranchInfo;
    delete model.orgInfo;
    delete model.orgUserInfo;
    delete model.requestTypeInfo;
    delete model.benCategoryInfo;
    delete model.creationDateString;
    delete model.actionDateString;

    model.creationDate = !model.creationDate ? model.creationDate : changeDateFromDatepicker(model.creationDate)?.toISOString();

    return model;
  }
}
