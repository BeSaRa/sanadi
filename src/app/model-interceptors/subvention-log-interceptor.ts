import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {SubventionLog} from '../models/subvention-log';
import {AdminResult} from '../models/admin-result';
import {getDateStringFromDate} from '../helpers/utils-date';

export class SubventionLogInterceptor implements IModelInterceptor<SubventionLog> {
  constructor() {
  }

  receive(model: SubventionLog): SubventionLog {
    model.orgInfo = AdminResult.createInstance(model.orgInfo);
    model.orgBranchInfo = AdminResult.createInstance(model.orgBranchInfo);
    model.orgUserInfo = AdminResult.createInstance(model.orgUserInfo);
    model.requestChannelInfo = AdminResult.createInstance(model.requestChannelInfo);
    model.actionTypeInfo = AdminResult.createInstance(model.actionTypeInfo);
    model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo);
    model.requestStatusInfo = model.requestStatusInfo ? AdminResult.createInstance(model.requestStatusInfo) : undefined;
    model.actionTimeString = model.actionTime ? getDateStringFromDate(model.actionTime, 'DEFAULT_DATE_FORMAT') : '';
    return model;
  }

  send(model: any | SubventionLog): any {
    delete model.service;
    delete model.actionTimeString;
    delete model.searchFields;
    return model;
  }

}
