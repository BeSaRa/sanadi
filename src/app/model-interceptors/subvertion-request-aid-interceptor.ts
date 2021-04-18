import {SubventionRequestAid} from '../models/subvention-request-aid';
import {AdminResult} from '../models/admin-result';
import {DatePipe} from '@angular/common';

function send(model: any): any {
  delete model.subventionRequestService;
  delete model.underProcessingSearchFields;
  delete model.creationDateString;
  delete model.aidCount;
  delete model.approvedAmount;
  delete model.statusDateModifiedString;
  return model;
}

function receive(model: SubventionRequestAid): (SubventionRequestAid | any) {
  model.orgBranchInfo = AdminResult.createInstance(model.orgBranchInfo);
  model.orgUserInfo = AdminResult.createInstance(model.orgUserInfo);
  model.orgInfo = AdminResult.createInstance(model.orgInfo);
  model.statusInfo = AdminResult.createInstance(model.statusInfo);
  model.aids = model.aids.map((aid) => {
    aid.aidLookupInfo = AdminResult.createInstance(aid.aidLookupInfo);
    model.approvedAmount += aid.aidAmount;
    if (aid.aidAmount) {
      model.aidCount += 1;
    }
    return aid;
  });
  // @ts-ignore
  model.creationDateString = new DatePipe('en-US').transform(model.creationDate);
  model.statusDateModifiedString = !model.statusDateModified ? '' : new DatePipe('en-US').transform(model.statusDateModified);

  return model;
}

export {
  send,
  receive
};
