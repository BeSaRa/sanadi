import {SubventionRequestAid} from '../models/subvention-request-aid';
import {AdminResult} from '../models/admin-result';

function send(model: any) {
  return model;
}

function receive(model: SubventionRequestAid) {
  model.aidLookupInfo = AdminResult.createInstance(model.aidLookupInfo);
  model.orgBranchInfo = AdminResult.createInstance(model.orgBranchInfo);
  model.orgInfo = AdminResult.createInstance(model.orgInfo);
  model.statusInfo = AdminResult.createInstance(model.statusInfo);
  return model;
}

export {
  send,
  receive
};
