import {AdminResult} from '../models/admin-result';
import {SubventionRequestPartialLog} from '../models/subvention-request-partial-log';
import {DateUtils} from '@helpers/date-utils';

export class SubventionRequestPartialLogInterceptor {
  receive(model: SubventionRequestPartialLog): SubventionRequestPartialLog {
    model.orgUserInfo = AdminResult.createInstance(model.orgUserInfo);
    model.orgInfo = AdminResult.createInstance(model.orgInfo);
    model.actionTypeInfo = AdminResult.createInstance(model.actionTypeInfo);
    model.aidLookupParentInfo = AdminResult.createInstance(model.aidLookupParentInfo);
    model.aidLookupInfo = AdminResult.createInstance(model.aidLookupInfo);

    model.creationDateString = DateUtils.getDateStringFromDate(model.creationDate);
    model.actionDateString = DateUtils.getDateStringFromDate(model.actionTime);
    return model;
  }

  send(model: any | SubventionRequestPartialLog): any {
    delete model.subventionRequestPartialLogService;
    delete model.orgInfo;
    delete model.orgUserInfo;
    delete model.aidLookupParentInfo;
    delete model.aidLookupInfo;
    delete model.creationDateString;
    delete model.actionDateString;

    model.creationDate = !model.creationDate ? model.creationDate : DateUtils.changeDateFromDatepicker(model.creationDate)?.toISOString();

    return model;
  }
}
