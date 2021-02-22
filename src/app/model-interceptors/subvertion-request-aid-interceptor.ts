import {SubventionRequestAid} from '../models/subvention-request-aid';
import {AdminResult} from '../models/admin-result';
import {SubventionApprovedAid} from '../models/subvention-approved-aid';

function send(model: any): any {
  delete model.subventionRequestService;
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
  return model;
}

export {
  send,
  receive
};
