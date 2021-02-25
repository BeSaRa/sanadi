import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {SubventionAid} from '../models/subvention-aid';
import {formatDate} from '@angular/common';
import {AdminResult} from '../models/admin-result';

export class SubventionAidInterceptor implements IModelInterceptor<SubventionAid> {
  receive(model: SubventionAid): SubventionAid {
    model.approvalDate = model.approvalDate ? formatDate(new Date(model.approvalDate), 'yyyy-MM-dd', 'en-US') : '';
    model.aidStartPayDate = model.aidStartPayDate ? formatDate(new Date(model.aidStartPayDate), 'yyyy-MM-dd', 'en-US') : '';
    model.aidLookupInfo = AdminResult.createInstance(model.aidLookupInfo);
    return model;
  }

  send(model: any): any {
    delete model.service;
    delete model.arName;
    delete model.enName;
    delete model.mainAidType;
    delete model.aidLookupInfo;
    model.approvalDate = model.approvalDate ? (new Date(model.approvalDate)).toISOString() : '';
    model.aidStartPayDate = model.aidStartPayDate ? (new Date(model.aidStartPayDate)).toISOString() : '';
    return model;
  }


}
