import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {SubventionLog} from '../models/subvention-log';
import {AdminResult} from '../models/admin-result';
import {DateUtils} from '../helpers/date-utils';

export class SubventionLogInterceptor implements IModelInterceptor<SubventionLog> {
  receive(model: SubventionLog): SubventionLog {
    model.orgInfo = AdminResult.createInstance(model.orgInfo);
    model.orgBranchInfo = AdminResult.createInstance(model.orgBranchInfo);
    model.orgUserInfo = AdminResult.createInstance(model.orgUserInfo);
    model.actionTypeInfo = AdminResult.createInstance(model.actionTypeInfo);
    model.actionTimeString = model.actionTime ? DateUtils.getDateStringFromDate(model.actionTime, 'DEFAULT_DATE_FORMAT') : '';
    return model;
  }

  send(model: any | SubventionLog): any {
    SubventionLogInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<SubventionLog> | any): void {
    delete model.service;
    delete model.actionTimeString;
    delete model.searchFields;
  }

}
