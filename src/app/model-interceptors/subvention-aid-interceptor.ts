import {SubventionAid} from '../models/subvention-aid';
import {formatDate} from '@angular/common';
import {AdminResult} from '../models/admin-result';
import {changeDateFromDatepicker, changeDateToDatepicker, getDateStringFromDate} from '../helpers/utils';

export class SubventionAidInterceptor {
  static receive(model: SubventionAid): SubventionAid {
    /*model.approvalDate = model.approvalDate ? formatDate(new Date(model.approvalDate), 'yyyy-MM-dd', 'en-US') : '';
    model.aidStartPayDate = model.aidStartPayDate ? formatDate(new Date(model.aidStartPayDate), 'yyyy-MM-dd', 'en-US') : '';*/

    model.approvalDateString = model.approvalDate ? getDateStringFromDate(model.approvalDate) : '';
    model.aidStartPayDateString = model.aidStartPayDate ? getDateStringFromDate(model.aidStartPayDate) : '';

    model.approvalDate = changeDateToDatepicker(model.approvalDate);
    model.aidStartPayDate = changeDateToDatepicker(model.aidStartPayDate);

    model.aidLookupInfo = AdminResult.createInstance(model.aidLookupInfo);
    model.periodicTypeInfo = AdminResult.createInstance(model.periodicTypeInfo);
    model.orgInfo = AdminResult.createInstance(model.orgInfo);
    model.orgBranchInfo = AdminResult.createInstance(model.orgBranchInfo);
    model.orgUserInfo = AdminResult.createInstance(model.orgUserInfo);
    return model;
  }

  static send(model: any): any {
    delete model.service;
    delete model.arName;
    delete model.enName;
    delete model.mainAidType;
    delete model.aidLookupInfo;
    delete model.periodicTypeInfo;
    delete model.orgInfo;
    delete model.orgBranchInfo;
    delete model.orgUserInfo;
    delete model.approvalDateString;
    delete model.aidStartPayDateString;
    /*model.approvalDate = model.approvalDate ? (new Date(model.approvalDate)).toISOString() : '';
    model.aidStartPayDate = model.aidStartPayDate ? (new Date(model.aidStartPayDate)).toISOString() : '';*/

    model.approvalDate = !model.approvalDate ? '' : changeDateFromDatepicker(model.approvalDate)?.toISOString();
    model.aidStartPayDate = !model.aidStartPayDate ? '' : changeDateFromDatepicker(model.aidStartPayDate)?.toISOString();

    return model;
  }


}
