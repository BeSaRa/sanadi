import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {Branch} from '@app/models/branch';
import {OfficerInterceptor} from '@app/model-interceptors/officer-interceptor';

export class BranchInterceptor implements IModelInterceptor<Branch> {
  caseInterceptor?: IModelInterceptor<Branch> | undefined;

  send(model: Partial<Branch>): Partial<Branch> {
    let officerInterceptor = new OfficerInterceptor();
    model.branchContactOfficerList?.map(x => {
      return officerInterceptor.send(x);
    });
    delete model.searchFields;
    return model;
  }

  receive(model: Branch): Branch {
    return model;
  }
}
