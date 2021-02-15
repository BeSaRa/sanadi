import {SubventionRequestAid} from '../models/subvention-request-aid';
import {AdminResult} from '../models/admin-result';
import {map as _map} from 'lodash';

function send(model: any): any {
  return model;
}

function receive(model: SubventionRequestAid): (SubventionRequestAid | any) {
  model.orgBranchInfo = AdminResult.createInstance(model.orgBranchInfo);
  model.orgInfo = AdminResult.createInstance(model.orgInfo);
  model.statusInfo = AdminResult.createInstance(model.statusInfo);
  model.aids = _map(model.aids, (aid) => {
    aid.aidLookupInfo = AdminResult.createInstance(aid.aidLookupInfo);
    return aid;
  });
  return model;
}

export {
  send,
  receive
};
