import {SubventionRequestAid} from '../models/subvention-request-aid';
import {AdminResult} from '../models/admin-result';
import {DatePipe} from '@angular/common';

function send(model: any): any {
  delete model.subventionRequestService;
  delete model.underProcessingSearchFields;
  delete model.creationDateString;
  return model;
}

function receive(model: SubventionRequestAid): (SubventionRequestAid | any) {
  model.orgBranchInfo = AdminResult.createInstance(model.orgBranchInfo);
  model.orgInfo = AdminResult.createInstance(model.orgInfo);
  model.statusInfo = AdminResult.createInstance(model.statusInfo);
  model.aids = model.aids.map((aid) => {
    aid.aidLookupInfo = AdminResult.createInstance(aid.aidLookupInfo);
    return aid;
  });
  // @ts-ignore
  model.creationDateString = new DatePipe('en-US').transform(model.creationDate);

  return model;
}

export {
  send,
  receive
};
