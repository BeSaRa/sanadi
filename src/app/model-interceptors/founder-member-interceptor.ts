import { AdminResult } from '@models/admin-result';
import { FounderMembers } from '@app/models/founder-members';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';

export class FounderMemberInterceptor implements IModelInterceptor<FounderMembers> {
  send(model: Partial<FounderMembers>): Partial<FounderMembers> {

    delete model.jobTitleInfo;
    delete model.nationalityInfo;
    delete model.searchFields
    return model;
  }

  receive(model: FounderMembers): FounderMembers {
    model.nationalityInfo && (model.nationalityInfo = AdminResult.createInstance(model.nationalityInfo));
    model.jobTitleInfo && (model.jobTitleInfo = AdminResult.createInstance(model.jobTitleInfo));
    return model;
  }
}
