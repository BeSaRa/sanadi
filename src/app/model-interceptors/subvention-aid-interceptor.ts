import {SubventionAid} from '../models/subvention-aid';
import {AdminResult} from '../models/admin-result';
import {DateUtils} from '@helpers/date-utils';

export class SubventionAidInterceptor {
  static receive(model: SubventionAid): SubventionAid {
    model.approvalDateString = model.approvalDate ? DateUtils.getDateStringFromDate(model.approvalDate) : '';
    model.aidStartPayDateString = model.aidStartPayDate ? DateUtils.getDateStringFromDate(model.aidStartPayDate) : '';

    model.approvalDate = DateUtils.changeDateToDatepicker(model.approvalDate);
    model.aidStartPayDate = DateUtils.changeDateToDatepicker(model.aidStartPayDate);

    model.aidLookupParentInfo = AdminResult.createInstance(model.aidLookupParentInfo);
    model.aidLookupInfo = AdminResult.createInstance(model.aidLookupInfo);
    model.periodicTypeInfo = AdminResult.createInstance(model.periodicTypeInfo);
    model.orgInfo = AdminResult.createInstance(model.orgInfo);
    model.orgBranchInfo = AdminResult.createInstance(model.orgBranchInfo);
    model.orgUserInfo = AdminResult.createInstance(model.orgUserInfo);
    model.donorInfo = AdminResult.createInstance(model.donorInfo);
    return model;
  }

  static send(model: any): any {
    delete model.service;
    delete model.arName;
    delete model.enName;
    delete model.mainAidType;
    delete model.aidLookupInfo;
    delete model.aidLookupParentInfo;
    delete model.periodicTypeInfo;
    delete model.donorInfo;
    delete model.orgInfo;
    delete model.orgBranchInfo;
    delete model.orgUserInfo;
    delete model.approvalDateString;
    delete model.aidStartPayDateString;
    delete model.searchFields;
    delete model.searchFieldsPartial;
    delete model.searchFieldsUserRequest;
    delete model.searchFieldsPartialRequestDetails;

    model.approvalDate = !model.approvalDate ? '' : DateUtils.changeDateFromDatepicker(model.approvalDate)?.toISOString();
    model.aidStartPayDate = !model.aidStartPayDate ? '' : DateUtils.changeDateFromDatepicker(model.aidStartPayDate)?.toISOString();

    return model;
  }


}
