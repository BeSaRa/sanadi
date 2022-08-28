import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { CharityBranch } from '@app/models/charity-branch';

export class CharityBranchInterceptor implements IModelInterceptor<CharityBranch>{
  caseInterceptor?: IModelInterceptor<CharityBranch> | undefined;
  send(model: Partial<CharityBranch>): Partial<CharityBranch> {
    return model;
  }
  receive(model: CharityBranch): CharityBranch {
    return model;
  }
}
