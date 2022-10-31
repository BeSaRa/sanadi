import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {Branch} from '@app/models/branch';

export class BranchInterceptor implements IModelInterceptor<Branch> {
  caseInterceptor?: IModelInterceptor<Branch> | undefined;

  send(model: Partial<Branch>): Partial<Branch> {
    return model;
  }

  receive(model: Branch): Branch {
    return model;
  }
}
