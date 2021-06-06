import {SubventionRequest} from '../models/subvention-request';
import {AdminResult} from '../models/admin-result';
import {DateUtils} from '../helpers/date-utils';

export class SubventionRequestInterceptor {
  static receive(model: SubventionRequest): SubventionRequest {
    model.orgBranchInfo = AdminResult.createInstance(model.orgBranchInfo);
    model.orgInfo = AdminResult.createInstance(model.orgInfo);
    model.orgUserInfo = AdminResult.createInstance(model.orgUserInfo);
    model.requestChannelInfo = AdminResult.createInstance(model.requestChannelInfo);
    model.requestStatusInfo = AdminResult.createInstance(model.requestStatusInfo);
    model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo);

    model.creationDateString = DateUtils.getDateStringFromDate(model.creationDate);
    model.creationDate = DateUtils.changeDateToDatepicker(model.creationDate);
    model.statusDateModifiedString = DateUtils.getDateStringFromDate(model.statusDateModified);
    model.statusDateModified = DateUtils.changeDateToDatepicker(model.statusDateModified);
    return model;
  }

  static send(model: any | SubventionRequest): any {
    delete model.service;
    delete model.subventionRequestAidService;
    delete model.orgBranchInfo;
    delete model.orgInfo;
    delete model.orgUserInfo;
    delete model.requestChannelInfo;
    delete model.requestStatusInfo;
    delete model.requestTypeInfo;
    delete model.searchFields;
    delete model.creationDateString;
    delete model.statusDateModifiedString;
    delete model.configService;

    model.creationDate = !model.creationDate ? model.creationDate : DateUtils.changeDateFromDatepicker(model.creationDate)?.toISOString();
    model.statusDateModified = !model.statusDateModified ? model.statusDateModified : DateUtils.changeDateFromDatepicker(model.statusDateModified)?.toISOString();

    return model;
  }
}
